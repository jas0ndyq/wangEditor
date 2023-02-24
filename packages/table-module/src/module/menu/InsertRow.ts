/**
 * @description insert row menu
 * @author wangfupeng
 */

import { Editor, Transforms, Range, Path } from 'slate'
import { IButtonMenu, IDomEditor, DomEditor, t } from '@wangeditor/core'
import { ADD_ROW_SVG } from '../../constants/svg'
import { TableRowElement, TableCellElement, TableElement } from '../custom-types'

class InsertRow implements IButtonMenu {
  readonly title = t('tableModule.insertRow')
  readonly iconSvg = ADD_ROW_SVG
  readonly tag = 'button'

  getValue(editor: IDomEditor): string | boolean {
    // 无需获取 val
    return ''
  }

  isActive(editor: IDomEditor): boolean {
    // 无需 active
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    const { selection } = editor
    if (selection == null) return true
    if (!Range.isCollapsed(selection)) return true

    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table') as TableElement
    if (tableNode == null) {
      // 选区未处于 table cell node ，则禁用
      return true
    }
    if (tableNode.isChooser) {
      return true
    }

    return false
  }

  exec(editor: IDomEditor, value: string | boolean) {
    if (this.isDisabled(editor)) return

    const [cellEntry] = Editor.nodes(editor, {
      match: n => DomEditor.checkNodeType(n, 'table-cell'),
      universal: true,
    })
    const [cellNode, cellPath] = cellEntry

    // 获取 cell length ，即多少列
    const rowNode = DomEditor.getParentNode(editor, cellNode)
    if (!rowNode) {
      return
    }
    let cellsLength = rowNode?.children.length || 0
    const rowNodeList = DomEditor.getParentNode(editor, rowNode)?.children.filter(el =>
      DomEditor.checkNodeType(el, 'table-row')
    )
    let maxColSpan = 0
    rowNodeList?.forEach((rowEl: any) => {
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
    if (cellsLength === 0) return
    if (maxColSpan > cellsLength) {
      cellsLength = maxColSpan
    }
    // 拼接新的 row
    const newRow: TableRowElement = { type: 'table-row', children: [] }
    for (let i = 0; i < cellsLength; i++) {
      const cell: TableCellElement = {
        type: 'table-cell',
        children: [{ text: '' }],
      }
      newRow.children.push(cell)
    }

    // 插入 row
    const rowPath = Path.parent(cellPath) // 获取 tr 的 path
    const newRowPath = Path.next(rowPath)
    Transforms.insertNodes(editor, newRow, { at: newRowPath })
  }
}

export default InsertRow
