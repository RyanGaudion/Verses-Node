function bookData(inputObj) {
   var { record, currentBook } = inputObj
    return {
      selectedBookName: '',
      selectedStart: '',
      selectedEnd: '',
      counter: 1,
      currentBook: currentBook,
      currentRecord: record,
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
          .then(response => { this.books = response})
          .then(() => this.defaultValue());
      },
      defaultValue(){
        if(this.currentRecord.book){
          this.selectedBookName = this.currentRecord.book;
          this.selectedStart = this.currentRecord.chapters[0];
          this.selectedEnd = this.currentRecord.chapters[this.currentRecord.chapters.length -1];
        }
        else{
          this.selectedBookName = this.currentBook.name;
          this.selectedStart = this.currentBook.chapter;
          this.selectedEnd = this.currentBook.chapter;
        }
      }
    };
  }