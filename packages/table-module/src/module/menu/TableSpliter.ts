/**
 * @description table header menu
 * @author wangfupeng
 */

import { Transforms, Range } from 'slate'
import { IButtonMenu, IDomEditor, DomEditor, t } from '@wangeditor/core'
import { CELL_SPLIT_SVG } from '../../constants/svg'
import { TableCellElement, TableElement } from '../custom-types'
import { getFirstRowCells, isTableWithChooser } from '../helpers'
import {
  mergeAll,
  regTableMouseMoveEvent,
  splitAll,
  splitAllWithNode,
} from '@wangeditor/table-module/src/utils/table'

class TableSpliter implements IButtonMenu {
  readonly title = t('tableModule.spliter')
  readonly iconSvg = CELL_SPLIT_SVG
  readonly tag = 'button'

  // 是否已设置表头
  getValue(editor: IDomEditor): string | boolean {
    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table') as TableElement
    if (tableNode == null) return false

    return isTableWithChooser(tableNode)
  }

  isActive(editor: IDomEditor): boolean {
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    const { selection } = editor
    if (selection == null) return true
    if (!Range.isCollapsed(selection)) return true

    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table') as TableElement
    if (tableNode == null) {
      // 选区未处于 table node ，则禁用
      return true
    }

    const cellNode = DomEditor.getSelectedNodeByType(editor, 'table-cell')
    if (cellNode == null) {
      // 选区未处于 table cell node ，则禁用
      return true
    }

    return !tableNode.isChooser
    // return false
  }

  exec(editor: IDomEditor) {
    if (this.isDisabled(editor)) return
    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table') as TableElement
    if (tableNode == null) return
    const tableDomNode = DomEditor.toDOMNode(editor, tableNode).querySelector('table')!
    if (!tableDomNode) {
      return
    }
    const cellDomNode = tableDomNode.querySelector('.temp-td-bg')!
    const cellNode = DomEditor.toSlateNode(editor, cellDomNode)
    // const cellNode = DomEditor.getSelectedNodeByType(editor, 'table-cell')
    // if (cellNode == null) {
    //   // 选区未处于 table cell node ，则禁用
    //   return
    // }
    // const cellDomNode = DomEditor.toDOMNode(editor, cellNode)
    console.log('cellNode: ', cellNode)
    console.log('cellDomNode: ', cellDomNode)

    splitAllWithNode(tableDomNode, editor, cellNode as TableCellElement, cellDomNode)
  }
}

export default TableSpliter
