const deleteClick = (id) => {
    var deletePopup = document.getElementById("deletePopup");
    document.getElementById('recordIdInput').value = id;
    deletePopup.classList.remove("hidden");
}

const cancelClick = () => {
    var deletePopup = document.getElementById("deletePopup");
    deletePopup.classList.add("hidden");
}

function pageData(count, page, limit) {
    return {
      recordCount: count,
      pageLimit: limit,
      get firstPage(){
        return this.middlePage - 1;
      },
      middlePage: page,
      get lastPage(){
          if((this.recordCount/this.recordCount) > this.middlePage){
              return 0;
          }
          else{
              return this.middlePage + 1;
          }
      }
    };
  }