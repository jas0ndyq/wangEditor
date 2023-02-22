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

export function mergeAll($table: HTMLElement) {
  REDIPS.table.merge('v', false, $table)
  setTimeout(() => {
    REDIPS.table.merge('h', true, $table)
    resetREDIPSSelected($table)
  }, 0)
}
