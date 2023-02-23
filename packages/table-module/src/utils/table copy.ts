import { DomEditor, IDomEditor } from '@wangeditor/core'
import { Transforms, Node, Path } from 'slate'
import { TableCellElement, TableRowElement } from '../module/custom-types'

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
      if (!trOffset || trOffset.nodeName != 'TR') {
        trOffset = document.createElement('tr')
      }
      const childList: any = []
      for (let i = 1; i <= colspan; i++) {
        // trOffset.appendChild(document.createElement('td'))
        childList.push({ type: 'table-cell', children: [{ text: '' }] })
      }
      const targetNode = trOffset.childNodes[0]
      const targetSlateNode = DomEditor.toSlateNode(editor, targetNode)
      const targetNodePath = DomEditor.findPath(editor, targetSlateNode)
      Transforms.insertNodes(editor, childList, { at: targetNodePath })

      trOffset = trOffset.nextElementSibling
      rowOffset--
    }
  }
  resetREDIPSSelected($table)
}
