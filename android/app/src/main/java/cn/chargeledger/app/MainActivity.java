package cn.chargeledger.app;

import android.Manifest;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.view.Gravity;
import android.view.animation.PathInterpolator;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** No remote pages or AI clients. The bridge is exposed exclusively to bundled assets. */
public final class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final int SAVE_FILE = 41, OPEN_FILE = 42, LOCATION_PERMISSION = 43;
    private WebView web;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final ExecutorService worker = Executors.newFixedThreadPool(2);
    private LocationManager locations;
    private LocationListener listener;
    private String locationToken;
    private int locationGeneration = 0;
    private boolean locating = false;
    private byte[] pendingFile;
    private boolean exportInProgress = false;
    private ModernBack modernBack;
    private View launchCover, launchIcon;
    private Runnable removeLaunch;
    private boolean uiFrameReady, launchExiting, reduceLaunch, launchReleased;
    private float brandX,brandY,brandSize;
    private volatile String lastInsets = "";

    /** API 31 types stay isolated from older Android runtimes. No second splash Activity. */
    private static final class SystemLaunch {
        static void install(MainActivity activity) {
            activity.getSplashScreen().setOnExitAnimationListener(splash -> {
                if(activity.launchReleased){splash.remove();return;}
                activity.launchCover=splash;activity.launchIcon=splash.getIconView();activity.removeLaunch=splash::remove;
                if(activity.uiFrameReady)activity.exitLaunch();
            });
        }
    }
    private void notifyLaunchReleased(boolean fast) {
        if(launchReleased)return;launchReleased=true;
        if(web!=null&&!isFinishing())web.evaluateJavascript("window.onNativeLaunchReleased&&window.onNativeLaunchReleased("+fast+")",null);
    }
    private void exitLaunch() {
        if(launchCover==null||launchExiting)return;launchExiting=true;
        final View cover=launchCover;final Runnable remove=removeLaunch;
        final boolean fast=reduceLaunch||!android.animation.ValueAnimator.areAnimatorsEnabled();
        Runnable complete=()->{
            remove.run();launchCover=null;launchIcon=null;removeLaunch=null;
            notifyLaunchReleased(fast);
        };
        // The native layer only hands off a painted frame. One WebView owns all visual motion.
        if(fast){complete.run();return;}
        cover.animate().alpha(0).setDuration(160).setInterpolator(new PathInterpolator(.22f,1f,.36f,1f)).withEndAction(complete).start();
    }

    /** API 33+ callback is active only inside the app, leaving root back-to-home to Android. */
    private static final class ModernBack {
        private final Activity activity;
        private final android.window.OnBackInvokedCallback callback;
        private boolean registered;
        ModernBack(Activity activity, Runnable action) { this.activity=activity;callback=action::run; }
        void setEnabled(boolean enabled) {
            if(enabled==registered)return;
            if(enabled)activity.getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT,callback);
            else activity.getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(callback);
            registered=enabled;
        }
    }

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        if(Build.VERSION.SDK_INT>=31)SystemLaunch.install(this);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        if(Build.VERSION.SDK_INT>=29){getWindow().setNavigationBarContrastEnforced(false);getWindow().setStatusBarContrastEnforced(false);}
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(249,251,255));
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(249,251,255));
        root.addView(web, new FrameLayout.LayoutParams(-1,-1));
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            android.view.WindowManager.LayoutParams attributes=getWindow().getAttributes();attributes.layoutInDisplayCutoutMode=android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;getWindow().setAttributes(attributes);
            root.setOnApplyWindowInsetsListener((v,insets) -> {
                android.graphics.Insets sys = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                android.graphics.Insets gestures = insets.getInsets(WindowInsets.Type.systemGestures());
                android.graphics.Insets ime = insets.getInsets(WindowInsets.Type.ime());
                boolean keyboard=insets.isVisible(WindowInsets.Type.ime());
                v.setPadding(0,0,0,keyboard?ime.bottom:0);
                float density=getResources().getDisplayMetrics().density;
                String values=(sys.top/density)+","+(sys.right/density)+","+(keyboard?0:sys.bottom/density)+","+(sys.left/density)+","+(gestures.left/density)+","+(gestures.right/density);
                if(!values.equals(lastInsets)){lastInsets=values;web.evaluateJavascript("window.__nativeInsets=["+values+"];window.onNativeInsets&&window.onNativeInsets(...window.__nativeInsets)",null);}
                return WindowInsets.CONSUMED;
            });
            root.setWindowInsetsAnimationCallback(new android.view.WindowInsetsAnimation.Callback(android.view.WindowInsetsAnimation.Callback.DISPATCH_MODE_STOP){
                @Override public WindowInsets onProgress(WindowInsets insets,List<android.view.WindowInsetsAnimation> animations){
                    int keyboardBottom=insets.getInsets(WindowInsets.Type.ime()).bottom;
                    root.setPadding(0,0,0,keyboardBottom);return insets;
                }
            });
            
        }else{
            // Legacy windows keep system bars outside the WebView; no duplicate CSS inset.
            getWindow().setStatusBarColor(Color.rgb(249,251,255));getWindow().setNavigationBarColor(Color.rgb(249,251,255));
        }
        if(Build.VERSION.SDK_INT<31){
            FrameLayout cover=new FrameLayout(this);cover.setBackgroundColor(Color.rgb(249,251,255));
            ImageView logo=new ImageView(this);logo.setImageResource(R.drawable.ic_launcher);
            int size=Math.round(112*getResources().getDisplayMetrics().density);cover.addView(logo,new FrameLayout.LayoutParams(size,size,Gravity.CENTER));root.addView(cover,new FrameLayout.LayoutParams(-1,-1));
            launchCover=cover;launchIcon=logo;removeLaunch=()->root.removeView(cover);
        }
        setContentView(root);
        if(Build.VERSION.SDK_INT>=30&&getWindow().getInsetsController()!=null)getWindow().getInsetsController().setSystemBarsAppearance(android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS|android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS|android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
        if(Build.VERSION.SDK_INT>=33)modernBack=new ModernBack(this,this::dispatchBack);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setTextZoom(100);
        if (Build.VERSION.SDK_INT >= 29) settings.setForceDark(WebSettings.FORCE_DARK_OFF);
        if (Build.VERSION.SDK_INT >= 33) settings.setAlgorithmicDarkeningAllowed(false);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if ("https".equals(u.getScheme()) && "appassets.androidplatform.net".equals(u.getHost()) && u.getPort() == -1 && u.getPath() != null && u.getPath().startsWith("/assets/")) {
                    String name = u.getPath().substring(8);
                    if (!name.contains("..") && name.matches("[a-zA-Z0-9_./-]+")) {
                        try { return new WebResourceResponse(mime(name), "utf-8", getAssets().open(name)); }
                        catch (Exception ignored) { }
                    }
                }
                return new WebResourceResponse("text/plain", "utf-8", 403, "Blocked", null, new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u=request.getUrl();
                if (u.toString().equals(ORIGIN+"/assets/index.html")) return false;
                if (request.isForMainFrame() && "https".equals(u.getScheme())) openExternal(u);
                return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "Android");
        web.loadUrl(ORIGIN+"/assets/index.html");
        handler.postDelayed(()->{if(!uiFrameReady&&!isFinishing()){uiFrameReady=true;reduceLaunch=true;exitLaunch();}},6000);
    }
    private static String mime(String name) {
        if(name.endsWith(".html"))return "text/html";
        if(name.endsWith(".css"))return "text/css";
        if(name.endsWith(".js"))return "application/javascript";
        if(name.endsWith(".svg"))return "image/svg+xml";
        if(name.endsWith(".woff2"))return "font/woff2";
        return "application/octet-stream";
    }
    private void openExternal(Uri uri) {
        try { startActivity(new Intent(Intent.ACTION_VIEW,uri)); }
        catch (Exception e) { callback("onNativeError","手机暂无可打开来源的浏览器。"); }
    }
    private void callback(String method,String argument) {
        runOnUiThread(() -> {
            if(web==null||isFinishing())return;
            if("onNativeImport".equals(method)&&argument.length()>96000) {
                web.evaluateJavascript("window.__importParts=[]",value -> importChunk(argument,0));
            } else web.evaluateJavascript("window."+method+" && window."+method+"("+JSONObject.quote(argument)+")",null);
        });
    }
    private void importChunk(String text,int offset) {
        if(web==null||isFinishing())return;
        if(offset>=text.length()) {
            web.evaluateJavascript("window.onNativeImport(window.__importParts.join(''));delete window.__importParts",null);return;
        }
        int end=Math.min(text.length(),offset+48000);
        if(end<text.length()&&Character.isHighSurrogate(text.charAt(end-1)))end--;
        final int next=end;
        web.evaluateJavascript("window.__importParts.push("+JSONObject.quote(text.substring(offset,end))+")",value -> importChunk(text,next));
    }
    private SharedPreferences preferences() {return getSharedPreferences("charge-ledger",MODE_PRIVATE);}
    private static String safeName(String name) {return name.replaceAll("[\\\\/:*?\"<>|]","_").substring(0,Math.min(name.length(),100));}
    private final class Bridge {
        @JavascriptInterface public String load() {return preferences().getString("state",null);}
        @JavascriptInterface public String insets() {return "["+lastInsets+"]";}
        @JavascriptInterface public void releaseLaunch() {
            runOnUiThread(()->{
                if(isFinishing()||launchReleased)return;
                if(launchCover!=null){launchCover.animate().cancel();reduceLaunch=true;launchExiting=false;exitLaunch();}
                else notifyLaunchReleased(true);
            });
        }
        @JavascriptInterface public void uiReady(float x,float y,float size,boolean reduced) {
            runOnUiThread(()->{
                if(uiFrameReady||isFinishing())return;brandX=x;brandY=y;brandSize=size;reduceLaunch=reduced;
                if(!lastInsets.isEmpty())web.evaluateJavascript("window.__nativeInsets=["+lastInsets+"];window.onNativeInsets&&window.onNativeInsets(...window.__nativeInsets)",null);
                web.postVisualStateCallback(1,new WebView.VisualStateCallback(){@Override public void onComplete(long id){if(isFinishing())return;uiFrameReady=true;exitLaunch();}});
            });
        }
        @JavascriptInterface public void setBackHandling(boolean enabled) {runOnUiThread(() -> {if(modernBack!=null&&!isFinishing())modernBack.setEnabled(enabled);});}
        @JavascriptInterface public boolean save(String raw) {
            try {if(raw.length()>20000000)return false;JSONObject o=new JSONObject(raw);if(o.getInt("schema")!=1||o.getJSONArray("records")==null)return false;return preferences().edit().putString("state",raw).commit();}
            catch(Exception e){return false;}
        }
        @JavascriptInterface public void exportFile(String name,String type,String content) {
            runOnUiThread(() -> {
                if(exportInProgress){callback("onNativeError","已有文件正在导出，请先完成保存。");return;}
                if(content.length()>20000000){callback("onNativeError","导出内容过大。");return;}
                pendingFile=content.getBytes(StandardCharsets.UTF_8);exportInProgress=true;
                Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(type).putExtra(Intent.EXTRA_TITLE,safeName(name));
                try { startActivityForResult(intent,SAVE_FILE); }
                catch(Exception e){pendingFile=null;exportInProgress=false;callback("onNativeError","文件选择器不可用，请尝试分享或复制。");}
            });
        }
        @JavascriptInterface public void importFile() {
            runOnUiThread(() -> {try {startActivityForResult(new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*").putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"application/json","text/plain","application/octet-stream"}),OPEN_FILE);}catch(Exception e){callback("onNativeError","文件选择器不可用。");}});
        }
        @JavascriptInterface public void shareFile(String name,String type,String content) {
            if(content.length()>20000000){callback("onNativeError","分享内容过大。");return;}
            worker.execute(() -> {try {
                File dir=new File(getCacheDir(),"shares");if(!dir.exists()&&!dir.mkdirs())throw new Exception();
                File file=new File(dir,safeName(name));try(FileOutputStream out=new FileOutputStream(file)){out.write(content.getBytes(StandardCharsets.UTF_8));}
                Uri uri=new Uri.Builder().scheme("content").authority("cn.chargeledger.app.share").appendPath(file.getName()).build();
                Intent intent=new Intent(Intent.ACTION_SEND).setType(type).putExtra(Intent.EXTRA_STREAM,uri).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                intent.setClipData(ClipData.newRawUri("充电手账",uri));
                runOnUiThread(() -> {try{startActivity(Intent.createChooser(intent,"分享充电记录"));}catch(Exception e){callback("onNativeError","分享面板不可用，请尝试导出。");}});
            }catch(Exception e){callback("onNativeError","文件准备失败，请尝试导出。");}});
        }
        @JavascriptInterface public boolean copy(String content) {
            if(content.length()>200000)return false;
            try {((ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("充电手账",content));return true;}
            catch(Exception e){return false;}
        }
        @JavascriptInterface public void locate(String token) {runOnUiThread(() -> requestLocation(token));}
        @JavascriptInterface public void finishApp() {runOnUiThread(() -> finish());}
    }
    @Override protected void onActivityResult(int request,int result,Intent data) {
        super.onActivityResult(request,result,data);
        if(request==SAVE_FILE) {
            final byte[] bytes=pendingFile;pendingFile=null;exportInProgress=false;
            if(result!=RESULT_OK||data==null||data.getData()==null){callback("onNativeExport","已取消导出。");return;}
            if(bytes==null){callback("onNativeError","导出中断，请重新导出。");return;}
            final Uri uri=data.getData();
            worker.execute(() -> {try(OutputStream out=getContentResolver().openOutputStream(uri,"wt")){if(out==null)throw new Exception();out.write(bytes);out.flush();callback("onNativeExport","文件已保存。");}catch(Exception e){callback("onNativeError","保存失败，请检查目标文件夹并重试。");}});
        } else if(request==OPEN_FILE&&result==RESULT_OK&&data!=null&&data.getData()!=null) {
            final Uri uri=data.getData();
            worker.execute(() -> {try(InputStream in=getContentResolver().openInputStream(uri);ByteArrayOutputStream out=new ByteArrayOutputStream()) {
                if(in==null)throw new Exception();byte[] buffer=new byte[8192];int len;
                while((len=in.read(buffer))!=-1){if(out.size()+len>20000000)throw new Exception();out.write(buffer,0,len);}
                callback("onNativeImport",new String(out.toByteArray(),StandardCharsets.UTF_8).replaceFirst("^\\uFEFF",""));
            }catch(Exception e){callback("onNativeError","读取失败，文件过大或无法访问，请选择有效的 JSON 文件。");}});
        }
    }
    private void requestLocation(String token) {
        cancelLocation();locationToken=token;locationGeneration++;
        if(checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)!=PackageManager.PERMISSION_GRANTED&&checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},LOCATION_PERMISSION);return;
        }
        startLocation();
    }
    @Override public void onRequestPermissionsResult(int request,String[] permissions,int[] results) {
        super.onRequestPermissionsResult(request,permissions,results);
        if(request==LOCATION_PERMISSION) {
            if(checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)==PackageManager.PERMISSION_GRANTED||checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED)startLocation();
            else locationFailure("定位权限未开启，可在系统设置中授权，或手动填写地点。");
        }
    }
    private void startLocation() {
        locations=(LocationManager)getSystemService(Context.LOCATION_SERVICE);locating=true;
        final int generation=locationGeneration;
        listener=new LocationListener(){
            @Override public void onLocationChanged(Location l){if(locating&&generation==locationGeneration){cancelLocation();resolveAddress(l,generation);}}
            @Override public void onStatusChanged(String provider,int status,Bundle extras){}
            @Override public void onProviderEnabled(String provider){}
            @Override public void onProviderDisabled(String provider){}
        };
        boolean started=false;
        boolean precise=checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED;
        try {
            for(String provider:new String[]{LocationManager.NETWORK_PROVIDER,LocationManager.GPS_PROVIDER}) {
                if(LocationManager.GPS_PROVIDER.equals(provider)&&!precise)continue;
                if(!locations.isProviderEnabled(provider))continue;
                Location cached=locations.getLastKnownLocation(provider);
                if(cached!=null&&SystemClock.elapsedRealtimeNanos()-cached.getElapsedRealtimeNanos()<120000000000L&&cached.getAccuracy()<=100){cancelLocation();resolveAddress(cached,generation);return;}
                locations.requestSingleUpdate(provider,listener,Looper.getMainLooper());started=true;
            }
        }catch(SecurityException e){cancelLocation();locationFailure("定位权限不足，请检查系统授权。");return;}
        catch(Exception ignored){}
        if(!started){cancelLocation();locationFailure("系统定位未开启或没有可用定位服务，请开启定位后重试。");return;}
        handler.postDelayed(() -> {if(locating&&generation==locationGeneration){cancelLocation();locationFailure("定位超时，请到信号较好的地方重试，或手动填写地点。");}},40000);
    }
    private void resolveAddress(Location l,int generation) {
        final String token=locationToken;
        worker.execute(() -> {String address="";
            try {if(Geocoder.isPresent()){List<Address> found=new Geocoder(this,Locale.SIMPLIFIED_CHINESE).getFromLocation(l.getLatitude(),l.getLongitude(),1);if(found!=null&&!found.isEmpty()){Address a=found.get(0);address=a.getAddressLine(0);if(address==null)address="";}}}catch(Exception ignored){}
            if(generation!=locationGeneration)return;
            try {JSONObject o=new JSONObject().put("token",token).put("lat",l.getLatitude()).put("lng",l.getLongitude()).put("accuracy",l.getAccuracy()).put("address",address);callback("onNativeLocation",o.toString());}catch(Exception ignored){}
        });
    }
    private void locationFailure(String message) {try{callback("onNativeLocation",new JSONObject().put("token",locationToken).put("error",message).toString());}catch(Exception ignored){}}
    private void cancelLocation() {locating=false;if(locations!=null&&listener!=null)try{locations.removeUpdates(listener);}catch(Exception ignored){}listener=null;}
    @Override protected void onStop(){cancelLocation();super.onStop();}
    private void dispatchBack(){if(web!=null)web.evaluateJavascript("window.onNativeBack && window.onNativeBack()",null);}
    @Override public void onBackPressed(){if(Build.VERSION.SDK_INT>=33){super.onBackPressed();return;}dispatchBack();}
    @Override protected void onDestroy(){if(modernBack!=null)modernBack.setEnabled(false);cancelLocation();locationGeneration++;worker.shutdownNow();handler.removeCallbacksAndMessages(null);if(web!=null){web.removeJavascriptInterface("Android");web.destroy();web=null;}super.onDestroy();}
}
