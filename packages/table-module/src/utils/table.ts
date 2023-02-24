import { DomEditor, IDomEditor } from '@wangeditor/core'
import { Transforms, Node, Path } from 'slate'
import { TableCellElement, TableElement, TableRowElement } from '../module/custom-types'

declare global {
  var REDIPS: any
}
function markTdWithREDIPSAttribute(td: any, flag: boolean) {
  td.className = 'temp-td-bg'
  td.redips = {
    selected: !!flag,
  }
}

function resetREDIPSSelected($table: HTMLElement) {
  const $tds = $table.querySelectorAll('td')
  $tds.forEach((el: any) => {
    el.redips = { selected: false }
    el.className = ''
  })
}

function getREDIPSTdKeyByTdElement($table: HTMLElement, td: any) {
  const cellObj = REDIPS.table.cellList($table)
  for (const key in cellObj) {
    if (Object.hasOwnProperty.call(cellObj, key)) {
      const tdel = cellObj[key]
      if (tdel == td) {
        return key
      }
    }
  }
  return null
}

function renderTdBgColorByKeyRange($table: HTMLElement, startKey: string, endKey: string) {
  if (!startKey || !endKey) {
    return
  }
  const tdKeyList: any = []
  const startKeyList = startKey.split('-').map(el => +el)
  const endKeyList = endKey.split('-').map(el => +el)
  const rowStart = startKeyList[0] < endKeyList[0] ? startKeyList[0] : endKeyList[0]
  const rowEnd = startKeyList[0] < endKeyList[0] ? endKeyList[0] : startKeyList[0]
  const colStart = startKeyList[1] < endKeyList[1] ? startKeyList[1] : endKeyList[1]
  const colEnd = startKeyList[1] < endKeyList[1] ? endKeyList[1] : startKeyList[1]

  for (let i = rowStart; i <= rowEnd; i++) {
    for (let j = colStart; j <= colEnd; j++) {
      tdKeyList.push(i + '-' + j)
    }
  }

  console.log('rowStart - rowEnd: ', rowStart, rowEnd)
  console.log('colStart - colEnd: ', colStart, colEnd)
  console.log('tdKeyList: ', tdKeyList)

  const cellObj = REDIPS.table.cellList($table)
  tdKeyList.forEach(el => {
    if (cellObj.hasOwnProperty(el)) {
      markTdWithREDIPSAttribute(cellObj[el], true)
    }
  })
}

export function regTableMouseMoveEvent($table: HTMLElement) {
  let ev = false
  let startEl: any = null
  let startElKey = ''
  let endEl: any = null
  let endElKey = ''

  console.log('$table reg: ', $table)

  const eventObj = {
    mousedown: (e: any) => {
      console.log('mouse down', e)
      if (e.target.nodeName == 'TD') {
        resetREDIPSSelected($table)
        ev = true
        startEl = e.target
        startElKey = getREDIPSTdKeyByTdElement($table, startEl)!
      }
      // startEl = getREDIPSTdKeyByTdElement($mouseOverEl)
    },
    mouseup: () => {
      ev = false
      console.log('start el: ', startEl, startElKey)
      console.log('end el: ', endEl, endElKey)
      startEl = null
      startElKey = ''
      endEl = null
      endElKey = ''
    },
    mousemove: e => {
      if (ev) {
        console.log('mouse move event: ', e)
        const $mouseOverEl = document.elementFromPoint(e.clientX, e.clientY)
        console.log('element is ', $mouseOverEl)
        if ($mouseOverEl?.nodeName == 'TD') {
          const key = getREDIPSTdKeyByTdElement($table, $mouseOverEl)
          console.log('mouse over td key: ', key)
          endEl = $mouseOverEl
          endElKey = key as any
          renderTdBgColorByKeyRange($table, startElKey, endElKey)
        }
      }
    },
  }

  $table.addEventListener('mousedown', eventObj.mousedown)
  $table.addEventListener('mouseup', eventObj.mouseup)
  $table.addEventListener('mousemove', eventObj.mousemove)
  return eventObj
}

export function unbindTableMouseEvent($table: HTMLElement, eventObj: any) {
  if (!eventObj) {
    return
  }
  $table.removeEventListener('mousedown', eventObj.mousedown)
  $table.removeEventListener('mouseup', eventObj.mouseup)
  $table.removeEventListener('mousemove', eventObj.mousemove)
}

export function mergeAll($table: HTMLElement, deleleFunc: Function) {
  REDIPS.table.merge('v', false, $table, deleleFunc)
  setTimeout(() => {
    REDIPS.table.merge('h', true, $table, deleleFunc)
    resetREDIPSSelected($table)
  }, 0)
}

export function splitAll($table: HTMLElement, td: HTMLElement) {
  const tdParentTr = td.parentElement
  if (!tdParentTr) {
    return
  }
  if (tdParentTr.nodeName != 'TR') {
    console.error('节点异常，父节点不是tr')
    return
  }
  let rowspan: any = td.getAttribute('rowspan')
  let colspan: any = td.getAttribute('colspan')
  td.removeAttribute('rowspan')
  td.removeAttribute('colspan')
  if (rowspan) {
    rowspan = +rowspan
  }
  if (colspan) {
    colspan = +colspan
  }
  if (!Number.isNaN(colspan) && colspan > 1) {
    for (let i = 1; i < colspan; i++) {
      td.after(document.createElement('td'))
    }
  }
  if (!Number.isNaN(rowspan) && rowspan > 1) {
    let rowOffset = rowspan - 1
    let trOffset = tdParentTr.nextElementSibling
    while (rowOffset > 0) {
      if (!trOffset || trOffset.nodeName != 'TR') {
        trOffset = document.createElement('tr')
      }
      for (let i = 1; i <= colspan; i++) {
        trOffset.appendChild(document.createElement('td'))
      }
      trOffset = trOffset.nextElementSibling
      rowOffset--
    }
  }
  resetREDIPSSelected($table)
}

export function splitAllWithNode(
  $table: HTMLElement,
  editor: IDomEditor,
  td: TableCellElement,
  tdDom: any
) {
  const tdDomParent = tdDom.parentElement
  const tdParentTr = DomEditor.getParentNode(editor, td)
  if (!tdParentTr) {
    return
  }
  const startIdx = tdParentTr.children.indexOf(td as any)
  const cellPath = DomEditor.findPath(editor, td)
  const parentTrPath = Path.parent(cellPath)
  // let rowspan: any = td.rowSpan
  // let colspan: any = td.colSpan
  // td.rowSpan = 1
  // td.colSpan = 1
  let rowspan: any = tdDom.getAttribute('rowspan')
  let colspan: any = tdDom.getAttribute('colspan')
  tdDom.removeAttribute('rowspan')
  tdDom.removeAttribute('colspan')
  if (rowspan) {
    rowspan = +rowspan
  }
  if (colspan) {
    colspan = +colspan
  }
  if (!Number.isNaN(colspan) && colspan > 1) {
    for (let i = 1; i < colspan; i++) {
      const newCell: TableCellElement = { type: 'table-cell', children: [{ text: '' }] }
      Transforms.insertNodes(editor, newCell, { at: cellPath })
    }
  }
  if (!Number.isNaN(rowspan) && rowspan > 1) {
    let rowOffset = rowspan - 1
    let trOffset = tdDomParent.nextElementSibling
    while (rowOffset > 0) {
      const childList: any = []
      for (let i = 1; i <= colspan; i++) {
        childList.push({ type: 'table-cell', children: [{ text: '' }] })
      }
      if (!trOffset || trOffset.nodeName != 'TR') {
        trOffset = document.createElement('tr')
        const newRow = { type: 'table-row', children: childList }
        Transforms.insertNodes(editor, newRow, { at: parentTrPath })
      } else {
        const idx =
          trOffset.childNodes.length > startIdx ? startIdx : trOffset.childNodes.length - 1
        const targetNode = trOffset.childNodes[idx]
        const targetSlateNode = DomEditor.toSlateNode(editor, targetNode)
        const targetNodePath = DomEditor.findPath(editor, targetSlateNode)
        Transforms.insertNodes(editor, childList, { at: targetNodePath })
      }

      trOffset = trOffset.nextElementSibling
      rowOffset--
    }
  }
  // Transforms.setNodes(
  //   editor,
  //   { colSpan: 1, rowSpan: 1 },
  //   {
  //     at: DomEditor.findPath(editor, td),
  //   }
  // )
  resetREDIPSSelected($table)
}

type TableModel = {
  flag: boolean
  target: [number, number]
}[][]

export function generateTableCellModel(
  table: TableElement,
  editor: IDomEditor,
  direction: 'v' | 'h'
) {
  let maxColSpan = 0
  const tableModel: TableModel = []

  table.children?.forEach((rowEl: any) => {
    tableModel.push([])
    let colspan = 0
    rowEl?.children.forEach(slateNode => {
      const domNode = DomEditor.toDOMNode(editor, slateNode)
      const col = domNode.getAttribute('colspan')
      if (col) {
        colspan += +col
      } else {
        colspan++
      }
    })
    maxColSpan = colspan > maxColSpan ? colspan : maxColSpan
  })
  tableModel.forEach((row, ridx) => {
    let start = 0
    while (start < maxColSpan) {
      row.push({
        flag: false,
        target: [ridx, start],
      })
      start++
    }
  })
  if (direction == 'v') {
    table.children?.forEach((rowEl: any, ridx: number) => {
      let left = 0

      for (let i = 0; i < tableModel[ridx].length; i++) {
        if (i == 0 && !tableModel[ridx][i].flag) {
          break
        }
        if (tableModel[ridx][i].flag) {
          left++
        } else {
          break
        }
      }
      rowEl?.children.forEach((cellEl: any, cidx: number) => {
        const cellDomNode = DomEditor.toDOMNode(editor, cellEl)
        const col = cellDomNode.getAttribute('colspan')
        const row = cellDomNode.getAttribute('rowspan')
        const colspan = col ? +col : 1
        const rowspan = row ? +row : 1
        if (colspan > 1) {
          for (let r = ridx; r < ridx + rowspan; r++) {
            for (let i = left; i < left + colspan; i++) {
              tableModel[r][i] = {
                flag: true,
                target: [ridx, cidx],
              }
            }
          }
        }
        left += colspan
      })
    })
  } else {
  }
  return tableModel
}

export function checkCellNodeColSiblingHasBigCell(
  ridx: number,
  cidx: number,
  tableModel: TableModel
) {
  let realCidx = 0
  let realCidxCount = 0
  for (let i = 0; i < tableModel[ridx].length; i++) {
    if (!tableModel[ridx][i].flag) {
      realCidxCount++
    }
    if (realCidxCount - 1 == cidx) {
      realCidx = i
      break
    }
    console.log('realCidxCount', realCidxCount)
  }
  let result = false
  for (let i = 0; i < tableModel.length; i++) {
    if (tableModel[i][realCidx].flag) {
      result = true
      break
    }
  }
  // console.log('ridx', ridx)
  // console.log('cidx', cidx)
  // console.log('realCidx', realCidx)
  // console.log('col ok?', result)
  return result
  // return tableModel.reduce((acc, cur) => (acc = (acc !== cur[realCidx].flag)), false)
}
