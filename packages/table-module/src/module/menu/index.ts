/**
 * @description table menu
 * @author wangfupeng
 */

import eduInsertTable from './InsertTable'
import DeleteTable from './DeleteTable'
import InsertRow from './InsertRow'
import DeleteRow from './DeleteRow'
import InsertCol from './InsertCol'
import DeleteCol from './DeleteCol'
import TableHander from './TableHeader'
import FullWidth from './FullWidth'
import TableChooser from './TableChooser'
import TableMerger from './TableMerger'
import TableSpliter from './TableSpliter'
import CellColor from './CellColor'

export const insertTableMenuConf = {
  key: 'insertTable',
  factory() {
    return new eduInsertTable()
  },
}

export const deleteTableMenuConf = {
  key: 'deleteTable',
  factory() {
    return new DeleteTable()
  },
}

export const insertTableRowConf = {
  key: 'insertTableRow',
  factory() {
    return new InsertRow()
  },
}

export const deleteTableRowConf = {
  key: 'deleteTableRow',
  factory() {
    return new DeleteRow()
  },
}

export const insertTableColConf = {
  key: 'insertTableCol',
  factory() {
    return new InsertCol()
  },
}

export const deleteTableColConf = {
  key: 'deleteTableCol',
  factory() {
    return new DeleteCol()
  },
}

export const tableHeaderMenuConf = {
  key: 'tableHeader',
  factory() {
    return new TableHander()
  },
}

export const tableChooserMenuConf = {
  key: 'tableChooser',
  factory() {
    return new TableChooser()
  },
}

export const tableMergerMenuConf = {
  key: 'tableMerger',
  factory() {
    return new TableMerger()
  },
}

export const cellColorMenuConf = {
  key: 'cellColor',
  factory() {
    return new CellColor()
  },
}

export const tableSpliterMenuConf = {
  key: 'tableSpliter',
  factory() {
    return new TableSpliter()
  },
}

export const tableFullWidthMenuConf = {
  key: 'tableFullWidth',
  factory() {
    return new FullWidth()
  },
}
