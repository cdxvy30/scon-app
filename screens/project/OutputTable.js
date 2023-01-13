import { AlignmentType, HeightRule, ImageRun, Paragraph, SectionType, Table, TableCell, TableRow, TextRun, UnderlineType, VerticalAlign, WidthType, PageBreak } from "docx";
import { getIssueStatusById } from './IssueEnum';

export function issueReportGenerator(projectName, project, selectedEndDate, selectedStartDate, selectedIssueList, issueList, fs){
  return [
    {
        children: [
            new Paragraph({children:[new TextRun({text: `${project.company}--缺失記錄表`, size: 40, bold: true,  })], alignment:AlignmentType.CENTER}),
            new Paragraph({
              children: [
                  new TextRun({text: "工程名稱：", size: 30, bold: true}),
                  new TextRun({text: `${projectName}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                  new TextRun({text:"  工地負責人：", size: 30, bold: true}),
                  new TextRun({text: `${project.manager}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
              ], alignment:AlignmentType.CENTER
            }),
            new Paragraph({
              children: [
                  new TextRun({text: "地址：", size: 30, bold: true}),
                  new TextRun({text: `${project.address}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                  new TextRun({text:"\t記錄人員：", size: 30, bold: true}),
                  new TextRun({text: `${project.inspector}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                  ], alignment:AlignmentType.CENTER
            }),
            new Paragraph({
              children: [
                  new TextRun({text:"  缺失日期範圍：", size: 30, bold: true}),
                  new TextRun({text: selectedEndDate?`${new Date(selectedStartDate).toLocaleDateString()} - ${new Date(selectedEndDate).toLocaleDateString()}`:`${new Date(project.created_at).toLocaleDateString()} - ${new Date().toLocaleDateString()}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}})
              ], alignment:AlignmentType.CENTER
            }),
            new Table({
              rows: issueRowsGenerator((selectedEndDate?selectedIssueList:issueList),fs),
              alignment:AlignmentType.CENTER,
            }),
        ],
    },
]
}

function issueRowsGenerator (issueList,fs) {
  var count = 0
  let rows = [
      new TableRow({
      children:[
          new TableCell({
          children: [new Paragraph({children:[new TextRun({text: "No.", size: 30, bold: true})], alignment:AlignmentType.CENTER}), ],
          verticalAlign:VerticalAlign.CENTER,
          width:{size:500, type:WidthType.DXA}
          }),
          new TableCell({
          children: [new Paragraph({children:[new TextRun({text: "缺失照片", size: 30, bold: true})], alignment:AlignmentType.CENTER}), ],
          verticalAlign:VerticalAlign.CENTER,
          width:{size:3500, type:WidthType.DXA}
          }),
          new TableCell({
          children: [new Paragraph({children:[new TextRun({text: "內容", size: 30, bold: true})], alignment:AlignmentType.CENTER}), ],
          verticalAlign:VerticalAlign.CENTER,
          width:{size:5800, type:WidthType.DXA},
          columnSpan:2
          }),
      ],
      tableHeader: true,
      cantSplit:true,
      }),
  ];
  for (let i = issueList.length - 1; i >= 0; i--){
  var issue_item = issueList[i].type;
  if (issue_item === '其他'){
      issue_item = issueList[i].type_remark
  }
  if (Math.round(count%4)==0 && count!=0){
    rows.push(
      new TableRow({
        children:[
          new TableCell({
              children: [new Paragraph({children:[new TextRun({text: `${issueList.length - i}`, size: 30, })], pageBreakBefore:true, alignment:AlignmentType.CENTER}), ],
              verticalAlign:VerticalAlign.CENTER,
              width:{size:500, type:WidthType.DXA},
              height:{size:6000, type:WidthType.DXA},
              rowSpan: 6,
              cantSplit:true,
          }),
          new TableCell({
              children: [new Paragraph({children:[new ImageRun({data:fs.readFile(`.${issueList[i].image.uri}`, "ascii") ,transformation:{width:[210],height:[157.5]}})], alignment:AlignmentType.CENTER}), ],
              verticalAlign:VerticalAlign.CENTER,
              width:{size:3500, type:WidthType.DXA},
              height:{size:6000, type:WidthType.DXA},
              rowSpan: 6,
              cantSplit:true,
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '類別', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: issueList[i].violation_type, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '項目', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: issueList[i].title, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '風險評級', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: `${getIssueStatusById(issueList[i].status).name}`, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '地點', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: issueList[i].location, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '工項負責人', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: issueList[i].assignee, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '手機號碼', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: issueList[i].assignee_phone_number, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [
              new Paragraph({children:[new TextRun({text: '', size: 30})], }),
              new Paragraph({children:[new TextRun({text: '', size: 30})], }),
            ],
            columnSpan:4,
            height:{size:500, type:WidthType.EXACT},
          }),
      ],
      cantSplit:true,
      }),
    )
  }
  else{
    rows.push(
      new TableRow({
        children:[
          new TableCell({
              children: [new Paragraph({children:[new TextRun({text: `${issueList.length - i}`, size: 30, })], alignment:AlignmentType.CENTER}), ],
              verticalAlign:VerticalAlign.CENTER,
              width:{size:500, type:WidthType.DXA},
              height:{size:6000, type:WidthType.DXA},
              rowSpan: 6,
              cantSplit:true,
          }),
          new TableCell({
              children: [new Paragraph({children:[new ImageRun({data:fs.readFile(`.${issueList[i].image.uri}`, "ascii") ,transformation:{width:[210],height:[157.5]}})], alignment:AlignmentType.CENTER}), ],
              verticalAlign:VerticalAlign.CENTER,
              width:{size:3500, type:WidthType.DXA},
              height:{size:6000, type:WidthType.DXA},
              rowSpan: 6,
              cantSplit:true,
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '類別', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: issueList[i].violation_type, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '項目', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: issueList[i].title, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '地點', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: issueList[i].location, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '責任廠商', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: issueList[i].responsible_corporation, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '手機號碼', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: issueList[i].assignee_phone_number, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: '記錄人員', size: 30, bold: true,})], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:1500, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
          new TableCell({
            children: [new Paragraph({children:[new TextRun({text: issueList[i].safetyManager, size: 28, })], }), ],
            verticalAlign:VerticalAlign.CENTER,
            width:{size:4000, type:WidthType.DXA},
            height:{size:1000, type:WidthType.DXA},
          }),
        ],
      }),
      new TableRow({
        children:[
          new TableCell({
            children: [
              new Paragraph({children:[new TextRun({text: '', size: 30})], }),
              new Paragraph({children:[new TextRun({text: '', size: 30})], }),
            ],
            columnSpan:4,
            height:{size:500, type:WidthType.EXACT},
          }),
      ],
      cantSplit:true,
      }),
    )
  }
  count = count + 1
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
        new Paragraph({children:[new TextRun({text: `${project.company}--缺失改善前後記錄表`, size: 40, bold: true,  })], pageBreakBefore:true, alignment:AlignmentType.CENTER}),
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
                      new TextRun({text:"\t記錄人員：", size: 30, bold: true}),
                      new TextRun({text: `${project.inspector}`, size: 30, bold: true,  underline:{type: UnderlineType.SINGLE}}),
                  ], alignment:AlignmentType.CENTER
                }),
                table = new Table({
                  rows: [
                    new TableRow({
                      children:[
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: "責任廠商", size: 32, bold:true })], alignment:AlignmentType.CENTER}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1000, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: issueList[i].responsible_corporation, size: 30, })], alignment:AlignmentType.LEFT}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1000, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: "聯絡電話", size: 32, bold:true })], alignment:AlignmentType.CENTER}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1000, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: `${issueList[i].assignee_phone_number}`, size: 30, })], alignment:AlignmentType.LEFT}), ],
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
                          children: [new Paragraph({children:[new TextRun({text: "風險評級", size: 32, bold:true})], alignment:AlignmentType.CENTER}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1500, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: `${getIssueStatusById(issueList[i].status).name}`, size: 30, })], alignment:AlignmentType.LEFT}), ],
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
                        children: [new Paragraph({children:[new TextRun({text: '改善前', size: 30, bold:true})], alignment:AlignmentType.CENTER}), ],
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
                                   new Paragraph({}),
                                   new Paragraph({children:[new TextRun({text: '缺失項目: ', size: 30, bold:true})], alignment:AlignmentType.LEFT}),
                                   new Paragraph({children:[new TextRun({text: issue_item, size: 30, })], alignment:AlignmentType.LEFT}),
                                   new Paragraph({}),
                                   new Paragraph({children:[new TextRun({text: '發現日期: ', size: 30, bold:true})], alignment:AlignmentType.LEFT}),
                                   new Paragraph({children:[new TextRun({text: `${new Date(issueList[i].timestamp).getFullYear()}/${new Date(issueList[i].timestamp).getMonth()+1}/${new Date(issueList[i].timestamp).getDate()}`, size: 30, })], alignment:AlignmentType.LEFT})],
                                   
                        width:{size:3200, type:WidthType.DXA},
                      }),
                    ],
                    height:{value:5100, rule:HeightRule.EXACT},
                    cantSplit:true,
                    }),
                    new TableRow({
                      children:[
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: '改善後', size: 30, bold:true})], alignment:AlignmentType.CENTER}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:1500, type:WidthType.DXA}
                        }),
                        new TableCell({
                          children: [new Paragraph({children:improve_image == null?[]:[new ImageRun({data: improve_image ,transformation:{width:[300],height:[225]}})], alignment:AlignmentType.CENTER}), ],
                          verticalAlign:VerticalAlign.CENTER,
                          width:{size:4700, type:WidthType.DXA},
                          columnSpan: 2,
                        }),
                        new TableCell({
                          children: [new Paragraph({children:[new TextRun({text: '備註', size: 30, bold:true,})], alignment:AlignmentType.LEFT}), 
                                     new Paragraph({children:[new TextRun({text: improve_remark, size: 30, })], alignment:AlignmentType.LEFT}), 
                                     new Paragraph({}),
                                     new Paragraph({children:[new TextRun({text: '改善日期: ', size: 30, bold:true})], alignment:AlignmentType.LEFT}), 
                                     new Paragraph({children:[new TextRun({text: improve_time, size: 30, })], alignment:AlignmentType.LEFT}),],
                          width:{size:3200, type:WidthType.DXA},               
                        }),
                      ],
                      height:{value:5100, rule:HeightRule.EXACT},
                      cantSplit:true,
                    })
                  ],
                  alignment:AlignmentType.CENTER,
                }),
      )
    };
    return (pages)
  }

export function issueExcelGenerator(){
  
  var data = [{
    "name": "John",
    "city": "Seattle"
  },
  {
    "name": "Mike",
    "city": "Los Angeles"
  },
  {
    "name": "Zach",
    "city": "New York"
  }];
  var ws = XLSX.utils.json_to_sheet(data);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cities");
  const wbout = XLSX.write(wb, {
    type: 'base64',
    bookType: "xlsx"
  });
  return(wbout)
}