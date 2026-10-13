window.TARIFFS = {
  "version": 1,
  "checkedAt": "2026-10-13",
  "provinces": [
    {
      "name": "北京",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业分时电价；站点零售收费另行公示",
          "url": "https://www.beijing.gov.cn/zhengce/zcjd/202308/t20230822_3227446.html",
          "policy": "京发改规〔2023〕11号",
          "effective": "2023年政策",
          "seasons": [
            {
              "months": [
                2,
                3,
                4,
                5,
                6,
                9,
                10,
                11
              ],
              "peak": "10:00—13:00、17:00—22:00",
              "valley": "23:00—07:00",
              "sharp": "",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                7,
                8
              ],
              "peak": "10:00—13:00、17:00—22:00",
              "valley": "23:00—07:00",
              "sharp": "11:00—13:00、16:00—17:00",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                1,
                12
              ],
              "peak": "10:00—13:00、17:00—22:00",
              "valley": "23:00—07:00",
              "sharp": "18:00—21:00",
              "note": "",
              "deep": ""
            }
          ],
          "note": "按2023年政策资料整理；北京2026年交易工作方案仍引用该政策。",
          "reason": ""
        }
      ]
    },
    {
      "name": "天津",
      "regions": [
        {
          "name": "工商业",
          "scope": "执行工商业电价的用户；尖峰仅大工业执行",
          "url": "https://energydc.cn/policy/tianjin/2025-09/af0de15c-022e-11f1-9954-46a1f660a16e",
          "policy": "津发改价管〔2025〕277号",
          "effective": "2025-10-01",
          "seasons": [
            {
              "months": [
                3,
                4,
                5,
                6,
                9,
                10,
                11
              ],
              "peak": "08:00—10:00、16:00—22:00",
              "valley": "00:00—06:00、12:00—14:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                7,
                8
              ],
              "peak": "15:00—23:00",
              "valley": "01:00—09:00",
              "sharp": "",
              "deep": "",
              "note": "大工业用户20:00—22:00执行尖峰。"
            },
            {
              "months": [
                1,
                2,
                12
              ],
              "peak": "08:00—10:00、16:00—22:00",
              "valley": "00:00—06:00、12:00—14:00",
              "sharp": "",
              "deep": "",
              "note": "大工业用户18:00—20:00执行尖峰。"
            }
          ],
          "note": "依据公开转载的政策文本整理，已与其他转载交叉核对；官方原文仍待复核。",
          "verified": false,
          "historical": false
        }
      ]
    },
    {
      "name": "河北",
      "regions": [
        {
          "name": "河北南网",
          "scope": "河北南网代理购电工商业；不满1千伏不执行尖峰、深谷电价",
          "url": "https://fgw.sjz.gov.cn/attachments/1/202510/21/%E3%80%8A%E5%85%B3%E4%BA%8E%E4%BC%98%E5%8C%96%E8%B0%83%E6%95%B4%E6%B2%B3%E5%8C%97%E5%8D%97%E7%BD%91%E5%B7%A5%E5%95%86%E4%B8%9A%E5%8F%8A%E5%85%B6%E4%BB%96%E7%94%A8%E6%88%B7%E5%88%86%E6%97%B6%E7%94%B5%E4%BB%B7%E6%94%BF%E7%AD%96%E7%9A%84%E9%80%9A%E7%9F%A5%E3%80%8B%EF%BC%88%E5%86%80%E5%8F%91%E6%94%B9%E8%83%BD%E4%BB%B7%E3%80%942025%E3%80%951115%E5%8F%B7%EF%BC%8920251021154529440.pdf",
          "policy": "冀发改能价〔2025〕1115号",
          "effective": "2025-11-01",
          "seasons": [
            {
              "months": [
                3,
                4,
                5
              ],
              "peak": "16:00—24:00",
              "valley": "03:00—07:00、11:00—12:00",
              "sharp": "",
              "deep": "12:00—15:00",
              "note": ""
            },
            {
              "months": [
                6,
                7,
                8
              ],
              "peak": "16:00—19:00、22:00—24:00",
              "valley": "01:00—07:00、12:00—14:00",
              "sharp": "19:00—22:00",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                9,
                10,
                11
              ],
              "peak": "16:00—24:00",
              "valley": "02:00—06:00、11:00—12:00、14:00—15:00",
              "sharp": "",
              "deep": "12:00—14:00",
              "note": ""
            },
            {
              "months": [
                1,
                2,
                12
              ],
              "peak": "07:00—09:00、19:00—23:00",
              "valley": "02:00—06:00、11:00—15:00",
              "sharp": "17:00—19:00",
              "deep": "",
              "note": ""
            }
          ],
          "note": "直接参与市场化交易的用户2026年起按河北南网年度电力交易方案执行。尖峰、深谷按接电等级核对，不能直接套用所有站点。",
          "verified": true,
          "historical": false
        },
        {
          "name": "冀北电网",
          "scope": "冀北电网与河北南网分开执行",
          "url": "https://hbdrc.hebei.gov.cn/",
          "policy": "冀北2025年末时段调整",
          "effective": "待核实",
          "seasons": [],
          "reason": "本次尚未核实冀北新文件完整时段，请查冀北电网公示；不要套用河北南网时段。"
        }
      ]
    },
    {
      "name": "山西",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业代理购电政策资料；山西地方电力公示",
          "url": "https://www.lvliang.gov.cn/llxxgk/zfxxgk/xxgkml/ggsydwxx_67083/gd_67091/202605/t20260515_2033389.html",
          "policy": "晋发改商品发〔2026〕15号；2026年5月价格公示",
          "effective": "2026-05-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                12
              ],
              "peak": "06:00—08:00、16:00—23:00",
              "valley": "02:00—05:00、10:00—15:00",
              "sharp": "17:00—20:00",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                3,
                4,
                5
              ],
              "peak": "06:00—08:00、17:00—24:00",
              "valley": "02:00—05:00、09:00—15:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                6,
                7,
                8
              ],
              "peak": "06:00—08:00、18:00—24:00",
              "valley": "02:00—05:00、10:00—15:00",
              "sharp": "18:00—21:00",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                9,
                10,
                11
              ],
              "peak": "06:00—08:00、17:00—24:00",
              "valley": "02:00—05:00、11:00—15:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "春节、劳动节、国庆节期间13:00—15:00为深谷，按具体假期执行。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "内蒙古",
      "regions": [
        {
          "name": "蒙西",
          "scope": "100千伏安及以上工商业；以下可选择",
          "url": "https://kdl.gov.cn/ztzl/zsyz/zyzc/202404/t20240407_837273.html",
          "policy": "内发改价费字〔2023〕1630号；2024年官方解读",
          "effective": "2024-02-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                9,
                10,
                11,
                12
              ],
              "peak": "06:00—08:00、18:00—22:00",
              "valley": "00:00—04:00、11:00—16:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                6,
                7,
                8
              ],
              "peak": "06:00—08:00、18:00—22:00",
              "valley": "11:00—16:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "仅展示峰谷基本时段；市场交易及特定尖峰、深谷请按电网公告核对。",
          "verified": true,
          "historical": false
        },
        {
          "name": "蒙东",
          "scope": "100千伏安及以上工商业；以下可选择",
          "url": "https://kdl.gov.cn/ztzl/zsyz/zyzc/202404/t20240407_837273.html",
          "policy": "内发改价费字〔2023〕1631号；2024年官方解读",
          "effective": "2024-02-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "peak": "06:00—09:00、17:00—22:00",
              "valley": "00:00—05:00、11:00—14:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "蒙西与蒙东时段不同，跨区时需确认所属电网。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "辽宁",
      "regions": [
        {
          "name": "工商业",
          "scope": "100千伏安及以上工商业；部分用户可选择",
          "url": "https://fgw.ln.gov.cn/fgw/index/tzgg/2023083014061818174/index.shtml",
          "policy": "辽发改价格〔2023〕441号",
          "effective": "2023-09-01",
          "seasons": [
            {
              "months": [
                2,
                3,
                4,
                5,
                6,
                9,
                10,
                11
              ],
              "peak": "07:30—10:30、16:00—21:00",
              "valley": "11:30—12:30、22:00—05:00",
              "sharp": "",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                1,
                7,
                8,
                12
              ],
              "peak": "07:30—10:30、16:00—21:00",
              "valley": "11:30—12:30、22:00—05:00",
              "sharp": "17:00—19:00",
              "note": "",
              "deep": ""
            }
          ],
          "note": "",
          "reason": ""
        }
      ]
    },
    {
      "name": "吉林",
      "regions": [
        {
          "name": "工商业",
          "scope": "非居民充换电设施按工商业规则执行；居民设施可选择其他规则",
          "url": "https://xxgk.jl.gov.cn/zcbm/fgw/xxgkmlqy/202501/t20250123_9045671.html",
          "policy": "吉发改价格〔2025〕11号",
          "effective": "2025-02-01；代理购电2025-04-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "peak": "08:00—10:00、16:00—21:00",
              "valley": "23:00—05:00、11:00—14:00",
              "sharp": "",
              "note": "尖峰按供需状况灵活启动，以提前公告为准。",
              "deep": ""
            }
          ],
          "note": "",
          "reason": ""
        }
      ]
    },
    {
      "name": "黑龙江",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业政策参考；具体接电类型以原文为准",
          "url": "https://www.hlj.gov.cn/hljzqc/c100117/202410/c00_31778258.shtml",
          "policy": "2024年峰谷分时电价调整文件",
          "effective": "2024年调整资料",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "peak": "07:00—08:00、09:00—11:30、15:30—20:00",
              "valley": "12:00—14:00、23:30—05:30",
              "sharp": "",
              "note": "",
              "deep": ""
            }
          ],
          "note": "本条仅录入已核实的峰、谷基本时段；特殊尖峰机制请查原文。",
          "reason": ""
        }
      ]
    },
    {
      "name": "上海",
      "regions": [
        {
          "name": "两部制",
          "scope": "一般工商业及其他两部制、大工业两部制",
          "url": "https://fgw.sh.gov.cn/fgw_jggl/20221216/e2652e3ab7ee49438d6e82af8880b160.html",
          "policy": "沪发改价管〔2022〕50号",
          "effective": "2023-01-01",
          "seasons": [
            {
              "months": [
                2,
                3,
                4,
                5,
                6,
                10,
                11
              ],
              "peak": "08:00—11:00、18:00—21:00",
              "valley": "22:00—06:00",
              "sharp": "",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                7,
                8
              ],
              "peak": "08:00—15:00、18:00—21:00",
              "valley": "22:00—06:00",
              "sharp": "12:00—14:00",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                9
              ],
              "peak": "08:00—15:00、18:00—21:00",
              "valley": "22:00—06:00",
              "sharp": "",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                1,
                12
              ],
              "peak": "08:00—11:00、18:00—21:00",
              "valley": "22:00—06:00",
              "sharp": "19:00—21:00",
              "note": "",
              "deep": ""
            }
          ],
          "note": "",
          "reason": ""
        },
        {
          "name": "单一制",
          "scope": "一般工商业及其他单一制",
          "url": "https://fgw.sh.gov.cn/fgw_jggl/20221216/e2652e3ab7ee49438d6e82af8880b160.html",
          "policy": "沪发改价管〔2022〕50号",
          "effective": "2023-01-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "peak": "06:00—22:00",
              "valley": "22:00—06:00",
              "sharp": "",
              "note": "",
              "deep": ""
            }
          ],
          "note": "",
          "reason": ""
        }
      ]
    },
    {
      "name": "江苏",
      "regions": [
        {
          "name": "季节性工商业",
          "scope": "工商业分时政策；商业等可选择",
          "url": "https://www.jsxishan.gov.cn/doc/2025/06/04/4586208.shtml",
          "policy": "苏发改价格发〔2025〕426号；表1",
          "effective": "2025-06-01",
          "seasons": [
            {
              "months": [
                3,
                4,
                5,
                9,
                10,
                11
              ],
              "peak": "15:00—22:00",
              "valley": "02:00—06:00、10:00—14:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                6,
                7,
                8,
                1,
                2,
                12
              ],
              "peak": "14:00—22:00",
              "valley": "00:00—06:00、11:00—13:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "315千伏安及以上工业用电尖峰：7—8月14:00—15:00、19:30—21:30；12—1月18:00—20:00。春节、劳动节、国庆节10:00—14:00深谷。限定工业规则不直接套用所有公用站。",
          "verified": true,
          "historical": false
        },
        {
          "name": "集中式充换电可选",
          "scope": "独立报装或独立受电点的集中式设施可全年选择春秋时段",
          "url": "https://www.jsxishan.gov.cn/doc/2025/06/04/4586208.shtml",
          "policy": "苏发改价格发〔2025〕426号第五条",
          "effective": "2025-06-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "peak": "15:00—22:00",
              "valley": "02:00—06:00、10:00—14:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "是否选择全年春秋时段由设施运营商确定；其他场所内设施应与所在工商业用户保持一致。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "浙江",
      "regions": [
        {
          "name": "集中式充换电",
          "scope": "向电网直接报装的经营性集中式充换电设施代理购电用户",
          "url": "https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3235/site/attach/0/74750626b30849a79d2910a77092f6b1.pdf",
          "policy": "浙发改价格〔2023〕316号；2025年11月公示附表3",
          "effective": "2025年11月公示资料",
          "seasons": [
            {
              "months": [
                2,
                3,
                4,
                5,
                6,
                9,
                10,
                11
              ],
              "peak": "08:00—11:00、13:00—17:00",
              "valley": "11:00—13:00、22:30—08:00",
              "sharp": "",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                1,
                7,
                8,
                12
              ],
              "peak": "08:00—09:00、21:00—22:30",
              "valley": "11:00—13:00、22:30—08:00",
              "sharp": "09:00—11:00、13:00—17:00",
              "note": "",
              "deep": ""
            }
          ],
          "note": "春节、劳动节、国庆节假期10:00—14:00为深谷；具体假期以国家公布为准。此处不将节假日时段显示为整月通用。",
          "reason": ""
        },
        {
          "name": "普通工商业",
          "scope": "普通工商业政策；不套用集中式充换电专用时段",
          "url": "https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3235/site/attach/0/74750626b30849a79d2910a77092f6b1.pdf",
          "policy": "浙发改价格〔2024〕21号；公示附表1",
          "effective": "2024年政策；2025年公示",
          "seasons": [
            {
              "months": [
                2,
                3,
                4,
                5,
                6,
                9,
                10,
                11
              ],
              "peak": "08:00—11:00、13:00—17:00",
              "valley": "00:00—08:00、11:00—13:00",
              "sharp": "",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                1,
                7,
                8,
                12
              ],
              "peak": "08:00—09:00、17:00—23:00",
              "valley": "00:00—08:00、11:00—13:00",
              "sharp": "09:00—11:00、15:00—17:00",
              "note": "",
              "deep": ""
            }
          ],
          "note": "节假日深谷另行执行；请核对站点是否属于专用充换电类型。",
          "reason": ""
        }
      ]
    },
    {
      "name": "安徽",
      "regions": [
        {
          "name": "工商业",
          "scope": "100千伏安及以上工商业；以下可按年度选择",
          "url": "https://fgw.huainan.gov.cn/tzgg/551823170.html",
          "policy": "皖发改价格〔2025〕302号",
          "effective": "2025-07-01",
          "seasons": [
            {
              "months": [
                2,
                3,
                4,
                5,
                6,
                10,
                11
              ],
              "peak": "06:00—08:00、16:00—22:00",
              "valley": "11:00—14:00、23:00—06:00",
              "sharp": "",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                7,
                8,
                9
              ],
              "peak": "16:00—24:00",
              "valley": "02:00—09:00、11:00—13:00",
              "sharp": "",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                1,
                12
              ],
              "peak": "15:00—23:00",
              "valley": "12:00—14:00、23:00—06:00",
              "sharp": "",
              "note": "",
              "deep": ""
            }
          ],
          "note": "315千伏安及以上两部制工业用电另有尖峰与节假日深谷：7/15—8/31的20:00—22:00、12/15—1/31的19:00—21:00为尖峰；三天及以上节假日11:00—15:00为深谷。不将限定工业规则直接套用于所有充电站。",
          "reason": ""
        }
      ]
    },
    {
      "name": "福建",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业政策参考；市场已形成分时价格的按市场规则",
          "url": "https://fgw.fujian.gov.cn/jdhy/zcwd/jggl_60675/202312/t20231220_6362350.htm",
          "policy": "闽发改规〔2023〕8号政策解读",
          "effective": "2023年政策资料",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                10,
                11,
                12
              ],
              "peak": "10:00—12:00、15:00—20:00、21:00—22:00",
              "valley": "00:00—08:00",
              "sharp": "",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                7,
                8,
                9
              ],
              "peak": "10:00—12:00、15:00—20:00、21:00—22:00",
              "valley": "00:00—08:00",
              "sharp": "11:00—12:00、17:00—18:00",
              "note": "",
              "deep": ""
            }
          ],
          "note": "",
          "reason": ""
        }
      ]
    },
    {
      "name": "江西",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业政策；居民电价规则不同",
          "url": "https://www.hukou.gov.cn/fgw/fdzdgknr/zdlyxx/jgsf/202506/t20250625_6936174.html",
          "policy": "2025年进一步完善分时电价机制政策解读",
          "effective": "2025年6月发布资料",
          "seasons": [
            {
              "months": [
                1,
                12
              ],
              "peak": "09:00—12:00、18:00—21:00",
              "valley": "00:00—06:00",
              "sharp": "18:00—20:00",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                2
              ],
              "peak": "16:00—22:00",
              "valley": "00:00—06:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                3,
                4,
                5,
                6,
                10,
                11
              ],
              "peak": "16:00—22:00",
              "valley": "01:00—05:00、11:30—14:30",
              "sharp": "",
              "deep": "12:00—14:00",
              "note": ""
            },
            {
              "months": [
                7,
                8
              ],
              "peak": "17:00—23:00",
              "valley": "01:00—05:00、11:30—14:30",
              "sharp": "20:30—22:30",
              "deep": "12:00—14:00",
              "note": ""
            },
            {
              "months": [
                9
              ],
              "peak": "17:00—23:00",
              "valley": "01:00—05:00、11:30—14:30",
              "sharp": "",
              "deep": "12:00—14:00",
              "note": ""
            }
          ],
          "note": "春节、劳动节、国庆节12:00—14:00另有深谷；1、2、12月节假日需单独核对。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "山东",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业分时政策；居民充电桩另有夜间谷时规则",
          "url": "https://jndpc.jinan.gov.cn/col/col2191/art/2026/art_34386df0ed6d4a3ea80720d55da3709e.html",
          "policy": "鲁发改价格函〔2026〕68号相关公告",
          "effective": "2026-10-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                12
              ],
              "peak": "07:00—09:00、16:00—21:00",
              "valley": "02:00—06:00、10:00—15:00",
              "sharp": "16:00—19:00",
              "deep": "11:00—14:00",
              "note": ""
            },
            {
              "months": [
                3,
                4,
                5,
                6
              ],
              "peak": "17:00—23:00",
              "valley": "08:00—15:00",
              "sharp": "17:00—22:00",
              "deep": "10:00—14:00",
              "note": ""
            },
            {
              "months": [
                7,
                8
              ],
              "peak": "16:00—23:00",
              "valley": "01:00—06:00",
              "sharp": "17:00—22:00",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                9,
                10,
                11
              ],
              "peak": "16:00—22:00",
              "valley": "09:00—15:00",
              "sharp": "17:00—20:00",
              "deep": "11:00—14:00",
              "note": ""
            }
          ],
          "note": "按2026-10-01起的新时段资料。未将居民充电桩23:00—07:00谷时规则混入工商业时段。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "河南",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业用户；商业与非居民照明可选择",
          "url": "https://public.zhengzhou.gov.cn/D300201X/8452948.jhtml",
          "policy": "豫发改价管〔2024〕283号",
          "effective": "2024年调整文件",
          "seasons": [
            {
              "months": [
                1,
                12
              ],
              "peak": "16:00—24:00",
              "valley": "00:00—07:00",
              "sharp": "17:00—19:00",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                2,
                6
              ],
              "peak": "16:00—24:00",
              "valley": "00:00—07:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                3,
                4,
                5,
                9,
                10,
                11
              ],
              "peak": "16:00—24:00",
              "valley": "00:00—06:00、11:00—14:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                7,
                8
              ],
              "peak": "16:00—24:00",
              "valley": "00:00—07:00",
              "sharp": "20:00—23:00",
              "deep": "",
              "note": ""
            }
          ],
          "note": "参与现货市场交易的用户原则上不再执行工商业政策峰谷，按交易规则。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "湖北",
      "regions": [
        {
          "name": "工商业",
          "scope": "100千伏安及以上工商业等政策范围；特定场所按专门规定",
          "url": "https://fgw.wuhan.gov.cn/zfxxgk/zfxxgk_1/qtzdgkwj/202501/P020250218332179233050.pdf",
          "policy": "鄂发改价管〔2024〕77号；绿色电价汇编191页起",
          "effective": "2024-05-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                9,
                10,
                11,
                12
              ],
              "peak": "16:00—18:00、20:00—24:00",
              "valley": "00:00—06:00、12:00—14:00",
              "sharp": "18:00—20:00",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                7,
                8
              ],
              "peak": "16:00—20:00、22:00—24:00",
              "valley": "00:00—06:00、12:00—14:00",
              "sharp": "20:00—22:00",
              "deep": "",
              "note": ""
            }
          ],
          "note": "2025年另增节假日深谷政策，具体适用用户和假期需核对最新公告。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "湖南",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业用电；小容量及特定行业可选择",
          "url": "https://fgw.hunan.gov.cn/fgw/jgzc11/202507/t20250702_33733479.html",
          "policy": "2025年优化分时电价政策",
          "effective": "2025-08-01",
          "seasons": [
            {
              "months": [
                2,
                3,
                4,
                5,
                6,
                9,
                10,
                11
              ],
              "peak": "16:00—24:00",
              "valley": "00:00—06:00、12:00—14:00",
              "sharp": "",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                7,
                8
              ],
              "peak": "16:00—24:00",
              "valley": "00:00—06:00、12:00—14:00",
              "sharp": "20:00—24:00",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                1,
                12
              ],
              "peak": "16:00—24:00",
              "valley": "00:00—06:00、12:00—14:00",
              "sharp": "18:00—22:00",
              "note": "",
              "deep": ""
            }
          ],
          "note": "",
          "reason": ""
        }
      ]
    },
    {
      "name": "广东",
      "regions": [
        {
          "name": "广东（不含深圳）",
          "scope": "工商业峰谷时段；公用站另有服务费",
          "url": "https://www.gzns.gov.cn/zwgk/zdlyxxgk/jghsf/jgzf/content/post_7760625.html",
          "policy": "粤发改价格〔2021〕331号",
          "effective": "2021-10-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "peak": "10:00—12:00、14:00—19:00",
              "valley": "00:00—08:00",
              "sharp": "",
              "note": "",
              "deep": ""
            }
          ],
          "note": "夏季及其他月份高温天可能执行尖峰规则，具体行业与条件见原文。",
          "reason": ""
        },
        {
          "name": "深圳",
          "scope": "深圳工业用户政策参考；具体站点收费以公示为准",
          "url": "https://www.sz.gov.cn/hdjlpt/detail?pid=3465596&via=pc",
          "policy": "深发改〔2021〕1005号；2026年政府答复",
          "effective": "2021年政策；2026年答复",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                10,
                11,
                12
              ],
              "peak": "10:00—12:00、14:00—19:00",
              "valley": "00:00—08:00",
              "sharp": "",
              "note": "其他月份日最高气温达到35℃及以上时，规定用户可能执行11:00—12:00、15:00—17:00尖峰。",
              "deep": ""
            },
            {
              "months": [
                7,
                8,
                9
              ],
              "peak": "10:00—12:00、14:00—19:00",
              "valley": "00:00—08:00",
              "sharp": "11:00—12:00、15:00—17:00",
              "note": "尖峰适用于大量、高需求工业及普通工业专变用户，不能直接等同所有公用站规则。",
              "deep": ""
            }
          ],
          "note": "",
          "reason": ""
        }
      ]
    },
    {
      "name": "广西",
      "regions": [
        {
          "name": "工商业政策参考",
          "scope": "工商业政策参考；实际充电设施类型及交易规则需核对",
          "url": "https://energydc.cn/policy/guangxi/2023-08/fb1d7614-9dd1-11f0-b69c-46a1f660a16d",
          "policy": "桂发改价格〔2023〕609号",
          "effective": "35千伏及以上2023-09-01；其他2024-01-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "peak": "11:00—13:00、17:00—23:00",
              "valley": "23:00—07:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "转载政策资料。另检索到2024年动态调整征求意见稿，未将意见稿当成已实施新政；出行前核对最新官方公告。",
          "verified": false,
          "historical": false
        }
      ]
    },
    {
      "name": "海南",
      "regions": [
        {
          "name": "电动汽车充换电",
          "scope": "非公交专用的电动汽车充换电设施；按所在场所类别计价",
          "url": "https://energydc.cn/policy/hainan/2024-09/5f7ed270-4cc6-11f1-a863-623645f0f17d",
          "policy": "琼发改规〔2024〕2号",
          "effective": "2024-10-01",
          "seasons": [
            {
              "months": [
                4,
                5,
                6,
                7,
                8,
                9
              ],
              "peak": "16:00—24:00",
              "valley": "02:00—10:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                1,
                2,
                3,
                10,
                11,
                12
              ],
              "peak": "16:00—24:00",
              "valley": "00:00—08:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "转载政策全文，结合公开报道交叉核对；官方原文待复核。新能源公交专用充电站另有时段，未用于本条。",
          "verified": false,
          "historical": false
        }
      ]
    },
    {
      "name": "重庆",
      "regions": [
        {
          "name": "工商业",
          "scope": "10千伏及以上、100kVA及以上大工业及普非工业动力用电",
          "url": "https://fzggw.cq.gov.cn/zwgk/zfxxgkml/zcwj/xzgfxwj/sfzggwxzgfxwj/202112/t20211209_10119678.html",
          "policy": "渝发改规范〔2021〕14号；2025年官方答复",
          "effective": "2021年政策；2025年答复确认",
          "seasons": [
            {
              "months": [
                2,
                3,
                4,
                5,
                6,
                9,
                10,
                11
              ],
              "peak": "11:00—17:00、20:00—22:00",
              "valley": "00:00—08:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                1,
                7,
                8,
                12
              ],
              "peak": "11:00—17:00、20:00—22:00",
              "valley": "00:00—08:00",
              "sharp": "12:00—14:00",
              "deep": "",
              "note": ""
            }
          ],
          "note": "",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "四川",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业；执行居民合表电价的充电设施按同一峰谷时段",
          "url": "https://bzqzf.gov.cn/public/6596741/11746368.html",
          "policy": "川发改价格〔2025〕185号",
          "effective": "2025-05-01",
          "seasons": [
            {
              "months": [
                3,
                4,
                5,
                6,
                10,
                11
              ],
              "peak": "10:00—12:00、17:00—22:00",
              "valley": "22:00—08:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                9
              ],
              "peak": "11:00—18:00、20:00—23:00",
              "valley": "01:00—07:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                7,
                8
              ],
              "peak": "11:00—18:00、20:00—23:00",
              "valley": "01:00—07:00",
              "sharp": "13:00—14:00、21:00—23:00",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                1,
                2,
                12
              ],
              "peak": "10:00—12:00、16:00—22:00",
              "valley": "00:00—08:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "其他月份连续三日最高气温达到35℃时可能灵活启动尖峰；部分送出受限区域大工业暂不执行尖峰。水期价格差异请查实际公示。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "贵州",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业政策；充换电实际综合价格另含服务费",
          "url": "https://fgw.guizhou.gov.cn/zwgk2025/zdlyxx/jffw/qt/202307/P020250806595063477426.pdf",
          "policy": "黔发改价格〔2023〕481号",
          "effective": "2023年政策资料",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "peak": "10:00—13:00、17:00—22:00",
              "valley": "00:00—08:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "按省发展改革委价格公报和2025年电网公示资料整理。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "云南",
      "regions": [
        {
          "name": "工商业",
          "scope": "大工业及100千伏安及以上一般工商业",
          "url": "https://www.baoshan.gov.cn/info/5278/10098344.htm",
          "policy": "云发改价格〔2024〕924号",
          "effective": "2025-01-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "peak": "07:00—09:00、18:00—24:00",
              "valley": "02:00—06:00、12:00—16:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "自2024-12-01暂缓尖峰。居民充电桩分时政策不作同样调整，需确认接电类型。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "西藏",
      "regions": [
        {
          "name": "大工业",
          "scope": "大工业用电示例；一般工商业分季节价格另行规定",
          "url": "https://drc.xizang.gov.cn/zwgk_1941/tadf/202510/P020251030384808860401.pdf",
          "policy": "藏发改办案字〔2025〕44号提案答复",
          "effective": "2025年官方答复资料",
          "seasons": [
            {
              "months": [
                5,
                6,
                7,
                8,
                9,
                10
              ],
              "peak": "",
              "valley": "11:00—17:00",
              "sharp": "",
              "deep": "03:00—06:00",
              "note": "丰水期以平段、低谷、深谷为主。"
            },
            {
              "months": [
                1,
                2,
                3,
                4,
                11,
                12
              ],
              "peak": "09:00—13:00、22:00—24:00",
              "valley": "",
              "sharp": "19:00—22:00",
              "deep": "",
              "note": "枯水期以平段、高峰、尖峰为主；未设置该条中的低谷时段。"
            }
          ],
          "note": "答复以昌都10千伏大工业为例，不能把所有充电站直接归为大工业。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "陕西",
      "regions": [
        {
          "name": "代理购电工商业",
          "scope": "陕西电网代理购电工商业；市场交易价格另行形成",
          "url": "https://fgw.ankang.gov.cn/Content-2839938.html",
          "policy": "陕发改价格〔2025〕1034号",
          "effective": "2025-08-01",
          "seasons": [
            {
              "months": [
                2,
                3,
                4,
                5,
                6,
                9,
                10,
                11
              ],
              "peak": "16:00—23:00",
              "valley": "00:00—06:00、11:00—14:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                7,
                8
              ],
              "peak": "16:00—23:00",
              "valley": "00:00—06:00、11:00—14:00",
              "sharp": "19:00—21:00",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                1,
                12
              ],
              "peak": "16:00—23:00",
              "valley": "00:00—06:00、11:00—14:00",
              "sharp": "18:00—20:00",
              "deep": "",
              "note": ""
            }
          ],
          "note": "",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "甘肃",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业等用户；清洁取暖及居民政策不同",
          "url": "https://linxia.gov.cn/lxz/zwgk/bmwj/art/2024/art_e81d003a037d49e6b58cd2cb5265d21c.html",
          "policy": "甘发改价格〔2024〕424号",
          "effective": "2024-08-01",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "peak": "06:00—08:00、18:00—23:00",
              "valley": "10:00—16:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "参与现货市场的价格不受此政策时段及价差约束。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "青海",
      "regions": [
        {
          "name": "代理购电政策参考",
          "scope": "2024年工商业政策参考；2026年市场交易规则另行执行",
          "url": "https://energydc.cn/policy/qinghai/2024-04/1efc7250-9dd3-11f0-9f49-46a1f660a16d",
          "policy": "2024年优化完善峰谷分时电价政策",
          "effective": "2024-05-01",
          "seasons": [
            {
              "months": [
                4,
                5,
                6,
                7,
                8,
                9
              ],
              "peak": "07:00—09:00、17:00—23:00",
              "valley": "09:00—17:00",
              "sharp": "",
              "deep": "",
              "note": ""
            },
            {
              "months": [
                1,
                2,
                3,
                10,
                11,
                12
              ],
              "peak": "07:00—09:00、17:00—23:00",
              "valley": "09:00—17:00",
              "sharp": "08:00—09:00、19:00—21:00",
              "deep": "",
              "note": ""
            }
          ],
          "note": "2024年正式通知转载，官方原文待复核。2026年直接交易主体已不再人为规定分时水平和时段；不能把此表当成市场交易用户统一时段。",
          "verified": false,
          "historical": false
        },
        {
          "name": "直接市场交易",
          "scope": "2026年直接参与市场交易的经营主体",
          "url": "https://xbj.nea.gov.cn/xxgk/zcjd/202603/t20260320_298288.html",
          "policy": "青海省电力中长期市场实施细则政策解读",
          "effective": "2026年规则",
          "seasons": [],
          "reason": "分时价格由双边协商或集中竞争形成，不再人为统一规定分时水平和时段，需核对站点实际价格。"
        }
      ]
    },
    {
      "name": "宁夏",
      "regions": [
        {
          "name": "工商业",
          "scope": "工商业用电（含代理购电）；具体价格按交易或公示",
          "url": "https://fzggw.nx.gov.cn/zzb/gzdt_69403/202301/t20230109_3908541.html",
          "policy": "2023年优化机制官方解读；2024年电网公示",
          "effective": "2023年政策；2024年公示",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "peak": "07:00—09:00、17:00—23:00",
              "valley": "09:00—17:00",
              "sharp": "",
              "deep": "",
              "note": ""
            }
          ],
          "note": "尖峰、深谷与交易价格机制以当期电网公告和交易方案为准，不能套用居民夜间低谷规则。",
          "verified": true,
          "historical": false
        }
      ]
    },
    {
      "name": "新疆",
      "regions": [
        {
          "name": "新疆电网",
          "scope": "工商业政策参考；北京时间；其他电网需单独核实",
          "url": "https://xjdrc.xinjiang.gov.cn/xjfgw/c108361/202205/8b04057426994741a337e65414673938.shtml",
          "policy": "2022年改革方案；2023年进一步完善分时电价通知",
          "effective": "2022年基本时段；2023年调整",
          "seasons": [
            {
              "months": [
                1,
                2,
                3,
                4,
                9,
                10,
                11,
                12
              ],
              "peak": "08:00—11:00、19:00—24:00",
              "valley": "02:00—08:00、14:00—16:00",
              "sharp": "",
              "note": "",
              "deep": ""
            },
            {
              "months": [
                5,
                6,
                7,
                8
              ],
              "peak": "08:00—11:00、19:00—24:00",
              "valley": "02:00—08:00、14:00—16:00",
              "sharp": "",
              "note": "",
              "deep": "14:00—16:00"
            }
          ],
          "note": "尖峰机制与执行范围请核对2023年通知；未把兵团或地方电网视为统一规则。",
          "reason": ""
        }
      ]
    },
    {
      "name": "香港",
      "regions": [
        {
          "name": "政策待核实",
          "scope": "尚未核实最新充电设施适用时段",
          "url": "https://www.emsd.gov.hk/",
          "policy": "",
          "effective": "",
          "seasons": [],
          "note": "",
          "reason": "香港由不同电力公司供电，没有可直接套用内地省级规则的统一公用充电峰谷表；按运营商收费核对。"
        }
      ]
    },
    {
      "name": "澳门",
      "regions": [
        {
          "name": "政策待核实",
          "scope": "尚未核实最新充电设施适用时段",
          "url": "https://www.cem-macau.com/",
          "policy": "",
          "effective": "",
          "seasons": [],
          "note": "",
          "reason": "澳门按当地电力及充电运营商收费执行，不能套用内地省级峰谷政策。"
        }
      ]
    },
    {
      "name": "台湾",
      "regions": [
        {
          "name": "政策待核实",
          "scope": "尚未核实最新充电设施适用时段",
          "url": "https://www.taipower.com.tw/",
          "policy": "",
          "effective": "",
          "seasons": [],
          "note": "",
          "reason": "当地时间电价及公用充电收费与内地制度不同，需按运营商、计价种类和季节核对。"
        }
      ]
    }
  ]
};
