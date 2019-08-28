
 
class MarkovBuilder {
  constructor(options) {
    this.algorithms = options.algorithms
    this.matrix = {}
  }

  processEvents(events) {
    const key = this.algorithms.getKey(events)
    if (!key) {
      console.error('Can\'t get key.')
      return
    }
    if (!this.matrix[key]) {
      this.matrix[key] = {
        totalCount: 0,
        eventSequence: this.algorithms.getEventSequence(events),
        next: {}
      }
    }

    const nextKey = this.algorithms.getNextKey(events)
    if (!nextKey) {
      console.error('Can\'t get next key')
      return
    }
    if (!this.matrix[key].next[nextKey]) {
      this.matrix[key].next[nextKey] = {
        count: 0,
        p: 0,
        event: this.algorithms.getNextEvent(events)
      }
    }

    this.matrix[key].totalCount += 1
    this.matrix[key].next[nextKey].count += 1
  }

  calculateP () {
    Object.keys(this.matrix).forEach(rowKey => {
      const row = this.matrix[rowKey]
      Object.keys(row.next).forEach(cellKey => {
        const cell = row.next[cellKey]
        cell.p = cell.count / row.totalCount
      })
    })
  }
}

module.exports = MarkovBuilder
