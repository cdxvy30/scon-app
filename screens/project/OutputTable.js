import { AlignmentType, HeightRule, ImageRun, Paragraph, Table, TableCell, TableRow, TextRun, UnderlineType, VerticalAlign, WidthType } from "docx";
import { getIssueStatusById } from './IssueEnum';
import { ISSUE_TYPE } from '../../configs/issueTypeConfig';


export function issueReportGenerator(projectName, project, selectedEndDate, selectedIssueList, issueList, fs){
  return [
    {
        properties: {},
        children: [
            new Paragraph({children:[new TextRun({text: "缺失記錄表", size: 40, bold: true,  })], alignment:AlignmentType.CENTER}),
            new Paragraph({
                children: [
                    new TextRun({text: "工程名稱：", size: 30, bold: true}),
                    new TextRun({text: `${projectName}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                    new TextRun({text:"\t\t巡檢人員：", size: 30, bold: true}),
                    new TextRun({text: `${project.inspector}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                ], alignment:AlignmentType.CENTER
            }),
            new Paragraph({
              children: [
                  new TextRun({text: "地址：", size: 30, bold: true}),
                  new TextRun({text: `${project.address}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                  new TextRun({text:"\t專案建立日期：", size: 30, bold: true}),
                  new TextRun({text: `${new Date(project.created_at).getFullYear()}/${new Date(project.created_at).getMonth()+1}/${new Date(project.created_at).getDate()}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
              ], alignment:AlignmentType.CENTER
            }),
            table = new Table({
              rows: issueRowsGenerator((selectedEndDate?selectedIssueList:issueList),fs),
              alignment:AlignmentType.CENTER,
            }),

        ],
    },
]
}

function issueRowsGenerator (issueList,fs) {
  let rows = [
      new TableRow({
      children:[
          new TableCell({
          children: [new Paragraph({children:[new TextRun({text: "編號", size: 30, })], alignment:AlignmentType.CENTER}), ],
          verticalAlign:VerticalAlign.CENTER,
          width:{size:500, type:WidthType.DXA}
          }),
          new TableCell({
          children: [new Paragraph({children:[new TextRun({text: "施工廠商", size: 30, })], alignment:AlignmentType.CENTER}), ],
          verticalAlign:VerticalAlign.CENTER,
          width:{size:500, type:WidthType.DXA}
          }),
          new TableCell({
          children: [new Paragraph({children:[new TextRun({text: "缺失照片", size: 30, })], alignment:AlignmentType.CENTER}), ],
          verticalAlign:VerticalAlign.CENTER,
          width:{size:4600, type:WidthType.DXA}
          }),
          new TableCell({
          children: [new Paragraph({children:[new TextRun({text: "缺失地點、內容", size: 30, })], alignment:AlignmentType.CENTER}), ],
          verticalAlign:VerticalAlign.CENTER,
          width:{size:1600, type:WidthType.DXA}
          }),
          new TableCell({
          children: [new Paragraph({children:[new TextRun({text: "風險狀態、時間、追蹤", size: 30, })], alignment:AlignmentType.CENTER}), ],
          verticalAlign:VerticalAlign.CENTER,
          width:{size:2000, type:WidthType.DXA}
          }),
          
      ],
      cantSplit:true,
      }),
  ];
      for (let i = issueList.length - 1; i >= 0; i--){
      var issue_item = issueList[i].type;
      if (issue_item === '其他'){
          issue_item = issueList[i].type_remark
      }
      
      rows.push(
          new TableRow({
          children:[
          new TableCell({
              children: [new Paragraph({children:[new TextRun({text: `${issueList.length - i}`, size: 30, })], alignment:AlignmentType.CENTER}), ],
              verticalAlign:VerticalAlign.CENTER,
              width:{size:500, type:WidthType.DXA}
          }),
          new TableCell({
              children: [new Paragraph({children:[new TextRun({text: issueList[i].assignee, size: 30, })], alignment:AlignmentType.CENTER}), ],
              verticalAlign:VerticalAlign.CENTER,
              width:{size:500, type:WidthType.DXA}
          }),
          new TableCell({
              children: [new Paragraph({children:[new ImageRun({data:fs.readFile(`.${issueList[i].image.uri}`, "ascii") ,transformation:{width:[240],height:[180]}})], alignment:AlignmentType.CENTER}), ],
              verticalAlign:VerticalAlign.CENTER,
              width:{size:4600, type:WidthType.DXA}
          }),
          new TableCell({
              children: [
              new Paragraph({children:[
                  new TextRun({text: `地點: ${issueList[i].location}`, size: 30, }),
              ], 
                  alignment:AlignmentType.CENTER}), 
              new Paragraph({children:[
                  new TextRun({text: `內容: ${issue_item}`, size: 30, }),
              ], 
                  alignment:AlignmentType.CENTER}),
              ],
              verticalAlign:VerticalAlign.CENTER,
              width:{size:1600, type:WidthType.DXA}
          }),
          new TableCell({
              children: [
              new Paragraph({children:[
                  new TextRun({text: `狀態: ${getIssueStatusById(issueList[i].status).name}`, size: 30, }),                              
              ], 
                  alignment:AlignmentType.CENTER}), 
              new Paragraph({children:[
                  new TextRun({text: `時間: ${new Date(issueList[i].timestamp).getFullYear()}/${new Date(issueList[i].timestamp).getMonth()+1}/${new Date(issueList[i].timestamp).getDate()}`, size: 30, }),
              ], 
                  alignment:AlignmentType.CENTER}),
              new Paragraph({children:[
                  new TextRun({text: `是否追蹤: ${issueList[i].tracking}`, size: 30, }),
              ], 
                  alignment:AlignmentType.CENTER}),  
              ],
              verticalAlign:VerticalAlign.CENTER,
              width:{size:2000, type:WidthType.DXA}
          }),
          ],
          height:{value:3000, rule:HeightRule.EXACT},
          cantSplit:true,
      }))
      }
  return (rows);
}

export function improveReportGenerator (issueList,fs,project,projectName) {
    let pages = [];
    for (let i = issueList.length - 1; i >= 0; i--){

      //判斷是否追蹤，如否則跳過此缺失
      if (issueList[i].tracking === false){  
        continue
      }

      //判斷改善資訊是否存在
      if (issueList[i]['attachments'][0] !== undefined){ 
        var improve_time = `${new Date(issueList[i]['attachments'][0]['updated_at']).getFullYear()}/${new Date(issueList[i]['attachments'][0]['updated_at']).getMonth()+1}/${new Date(issueList[i]['attachments'][0]['updated_at']).getDate()}`
        var improve_remark = issueList[i]['attachments'][0]['remark']
        var improve_image = fs.readFile(`.${issueList[i]['attachments'][0]['image']}`, "ascii")
      } else{
        var improve_time = '未改善'
        var improve_remark = '未改善'
        var improve_image = null
      }

      //抓出缺失項目選「其他」 的訊息
      var issue_item = issueList[i].type;
      if (issue_item === '其他'){
        issue_item = issueList[i].type_remark
      }

      var issue_title = issueList[i].violation_type;
      
      pages.push(
        new Paragraph({children:[new TextRun({text: "缺失改善前後記錄表", size: 40, bold: true,  })], alignment:AlignmentType.CENTER}),
                new Paragraph({
                    children: [
                        new TextRun({text: "工程名稱：", size: 30, bold: true}),
                        new TextRun({text: `${projectName}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                        new TextRun({text:"\t\t工地負責人：", size: 30, bold: true}),
                        new TextRun({text: `${project.manager}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                    ], alignment:AlignmentType.CENTER
                }),
                new Paragraph({
                  children: [
                      new TextRun({text: "地址：", size: 30, bold: true}),
                      new TextRun({text: `${project.address}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                      new TextRun({text:"\t專案建立日期：", size: 30, bold: true}),
                      new TextRun({text: `${new Date(project.created_at).getFullYear()}/${new Date(project.created_at).getMonth()+1}/${new Date(project.created_at).getDate()}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                  ], alignment:AlignmentType.CENTER
                }),
                table = new Table({
                  rows: [
                    new TableRow({
                      children:[
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: "施工廠商", size: 32, bold:true })], alignment:AlignmentType.CENTER}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1000, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: issueList[i].assignee, size: 30, })], alignment:AlignmentType.LEFT}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1000, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: "記錄人員", size: 32, bold:true })], alignment:AlignmentType.CENTER}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1000, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: project.inspector, size: 30, })], alignment:AlignmentType.LEFT}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1000, type:WidthType.DXA}
                        }),
                        
                      ],
                      height:{value:1000, rule:HeightRule.EXACT},
                      cantSplit:true,
                    }),
                    new TableRow({
                      children:[
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: "缺失地點", size: 32, bold:true})], alignment:AlignmentType.CENTER}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1500, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: issueList[i].location, size: 30, })], alignment:AlignmentType.LEFT}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:3200, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: "發現日期", size: 32, bold:true})], alignment:AlignmentType.CENTER}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1500, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: `${new Date(issueList[i].timestamp).getFullYear()}/${new Date(issueList[i].timestamp).getMonth()+1}/${new Date(issueList[i].timestamp).getDate()}`, size: 30, })], alignment:AlignmentType.LEFT}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:3200, type:WidthType.DXA}
                        }),
                        
                      ],
                      height:{value:1000, rule:HeightRule.EXACT},
                      cantSplit:true,
                    }),
                    new TableRow({
                    children:[
                      new TableCell({
                        children: [new Paragraph({children:[new TextRun({text: '缺失照片', size: 30, bold:true})], alignment:AlignmentType.CENTER}), ],
                        verticalAlign:VerticalAlign.CENTER,
                        width:{size:1500, type:WidthType.DXA}
                      }),
                      new TableCell({
                        children: [new Paragraph({children:[new ImageRun({data:fs.readFile(`.${issueList[i].image.uri}`, "ascii") ,transformation:{width:[300],height:[225]}})], alignment:AlignmentType.CENTER}), ],
                        verticalAlign:VerticalAlign.CENTER,
                        width:{size:4700, type:WidthType.DXA},
                        columnSpan: 2,
                      }),
                      new TableCell({
                        children: [new Paragraph({children:[new TextRun({text: '缺失類別: ', size: 30, bold:true})], alignment:AlignmentType.LEFT}), 
                                   new Paragraph({children:[new TextRun({text: issue_title, size: 30, })], alignment:AlignmentType.LEFT}),
                                   new Paragraph({children:[new TextRun({text: '缺失概述: ', size: 30, bold:true})], alignment:AlignmentType.LEFT}),
                                   new Paragraph({children:[new TextRun({text: issue_item, size: 30, })], alignment:AlignmentType.LEFT})],
                        width:{size:3200, type:WidthType.DXA},
                      }),
                    ],
                    height:{value:5200, rule:HeightRule.EXACT},
                    cantSplit:true,
                    }),
                    new TableRow({
                      children:[
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: '改善後照片', size: 30, bold:true})], alignment:AlignmentType.CENTER}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1500, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new ImageRun({data: improve_image ,transformation:{width:[300],height:[255]}})], alignment:AlignmentType.CENTER}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:4700, type:WidthType.DXA},
                          columnSpan: 2,
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: '改善備註', size: 30, bold:true,})], alignment:AlignmentType.LEFT}), 
                                     new Paragraph({children:[new TextRun({text: improve_remark, size: 30, })], alignment:AlignmentType.LEFT}), 
                                     new Paragraph({}),
                                     new Paragraph({children:[new TextRun({text: '改善日期: ', size: 30, bold:true})], alignment:AlignmentType.LEFT}), 
                                     new Paragraph({children:[new TextRun({text: improve_time, size: 30, })], alignment:AlignmentType.LEFT}),],
                          width:{size:3200, type:WidthType.DXA},               
                        }),
                      ],
                      height:{value:5200, rule:HeightRule.EXACT},
                      cantSplit:true,
                    })
                  ],
                  alignment:AlignmentType.CENTER,
                }),
      )
    };
    return (pages)
  }