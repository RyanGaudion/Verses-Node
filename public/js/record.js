function bookData() {
    return {
      selectedBookName: '',
      selectedStart: '',
      counter: 1,
      get currentItem(){
        var result =  typeof this.selectedBookName !== 'undefined' ? this.books.filter(i => i.name == this.selectedBookName)[0] : {chapters: 0};
        return typeof result !== 'undefined' ? result : {chapters: 0};
      },

      //How many numebrs to display in end chapter loop
      get selectedStartNumber(){
        return Number(typeof this.selectedStart !== 'undefined' ? this.selectedStart  : 0);
      },
      get selectedEndCount(){
        return this.currentItem.chapters - (this.selectedStartNumber - 1) ;
      },
      books: [],
      init() {
        // Testdata, in case I hit my 60 calls per hour
        fetch('/api/book/getall')
          .then(response => response.json())
          .then(response => { this.books = response});
      }
    };
  }