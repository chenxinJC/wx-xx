import {
  KeywordModel
} from '../../models/keyword.js'
import {
  BookModel
} from '../../models/book.js'
import {
  paginationBev
} from '../behaviors/pagination.js'

const keywordModel = new KeywordModel()
const bookModel = new BookModel()
Component({
  behaviors: [paginationBev],
  /**
   * 组件的属性列表
   */
  properties: {
    getHotWords: Array,
    more: {
      type: String,
      observer: 'loadMore'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    historyWords: [],
    hotWords: [],
    searching: false,
    q: '',
    // loading: false,
    loadingCenter: false
  },

  attached() {
    this.setData({
      historyWords: keywordModel.getHistory(),
      hotWords: this.properties.getHotWords
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    loadMore() {
      if (!this.data.q) {
        return
      }
      if (this.isLocked()) {
        return
      }
      if (this.hasMore()) {
        this.locked()
        bookModel.search(this.getCurrentStart(), this.data.q)
          .then(res => {
            this.setMoreData(res.books)
            this.unLocked()
          }, () => {
            this.unLocked()
          })
      }
    },
		onCancel(e) {
			this.initialize()
      this.triggerEvent('cancel', {}, {})
    },

		onDelete(e) {
			this.initialize()
      this._closeResult()
    },

		onConfirm(e) {
			const q = e.detail.value || e.detail.text
      this._showResult(q)
      this._showLoadingCenter()
      bookModel.search(0, q).then(res => {
        console.log(res)
        this.setMoreData(res.books)
        this.setTotal(res.total)
        keywordModel.addToHistory(q)
        this._hideLoadingCenter()
      })
    },

    _showLoadingCenter() {
      this.setData({
        loadingCenter: true
      })
    },

    _hideLoadingCenter() {
      this.setData({
        loadingCenter: false
      })
    },

    _showResult(q) {
      this.setData({
        searching: true,
				q
      })
    },

    _closeResult() {
      this.setData({
        searching: false,
				q: ''
      })
    }
  }
})