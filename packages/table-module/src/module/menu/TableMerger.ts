/**
 * @description table header menu
 * @author wangfupeng
 */

import { Transforms, Range } from 'slate'
import { IButtonMenu, IDomEditor, DomEditor, t } from '@wangeditor/core'
import { CELL_CHOOSE_SVG } from '../../constants/svg'
import { TableElement } from '../custom-types'
import { getFirstRowCells, isTableWithChooser } from '../helpers'
import { mergeAll, regTableMouseMoveEvent } from '@wangeditor/table-module/src/utils/table'

class TableMerger implements IButtonMenu {
  readonly title = t('tableModule.chooser')
  readonly iconSvg = CELL_CHOOSE_SVG
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
    return !tableNode.isChooser
    // return false
  }

  exec(editor: IDomEditor) {
    if (this.isDisabled(editor)) return
    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table') as TableElement
    if (tableNode == null) return
    console.log('tableNode is: ', tableNode, DomEditor.toDOMNode(editor, tableNode))
    const tableDomNode = DomEditor.toDOMNode(editor, tableNode).querySelector('table')!
    if (tableDomNode) {
      mergeAll(tableDomNode)
    }
  }
}

export default TableMerger
