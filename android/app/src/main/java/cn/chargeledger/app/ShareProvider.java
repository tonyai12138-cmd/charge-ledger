package cn.chargeledger.app;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

/** Read-only, non-exported provider; access is granted for the system share action only. */
public final class ShareProvider extends ContentProvider {
    @Override public boolean onCreate(){return true;}
    private File resolve(Uri uri) throws FileNotFoundException {
        try{if(uri.getPathSegments().size()!=1)throw new Exception();String name=uri.getLastPathSegment();File root=new File(getContext().getCacheDir(),"shares").getCanonicalFile();File file=new File(root,name).getCanonicalFile();if(!root.equals(file.getParentFile())||!file.isFile())throw new Exception();return file;}catch(Exception e){throw new FileNotFoundException();}
    }
    @Override public String getType(Uri uri){return "text/markdown";}
    @Override public ParcelFileDescriptor openFile(Uri uri,String mode) throws FileNotFoundException {if(!"r".equals(mode))throw new FileNotFoundException("Read only");return ParcelFileDescriptor.open(resolve(uri),ParcelFileDescriptor.MODE_READ_ONLY);}
    @Override public Cursor query(Uri uri,String[] projection,String selection,String[] args,String order){try{File file=resolve(uri);String[] cols=projection==null?new String[]{OpenableColumns.DISPLAY_NAME,OpenableColumns.SIZE}:projection;MatrixCursor cursor=new MatrixCursor(cols);Object[] values=new Object[cols.length];for(int i=0;i<cols.length;i++)values[i]=OpenableColumns.DISPLAY_NAME.equals(cols[i])?file.getName():OpenableColumns.SIZE.equals(cols[i])?file.length():null;cursor.addRow(values);return cursor;}catch(FileNotFoundException e){return null;}}
    @Override public Uri insert(Uri uri,ContentValues values){throw new UnsupportedOperationException();}
    @Override public int delete(Uri uri,String selection,String[] args){throw new UnsupportedOperationException();}
    @Override public int update(Uri uri,ContentValues values,String selection,String[] args){throw new UnsupportedOperationException();}
}
