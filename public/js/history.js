const deleteClick = (id) => {
    var deletePopup = document.getElementById("deletePopup");
    document.getElementById('recordIdInput').value = id;
    deletePopup.classList.remove("hidden");
}

const cancelClick = () => {
    var deletePopup = document.getElementById("deletePopup");
    deletePopup.classList.add("hidden");
}

window.onload = function(){
  var divToHide = document.getElementById("filterMenu");
  var parentDiv = document.getElementById("filterParent");
  document.onclick = function(e){
    if(!parentDiv.contains(e.target)){
      //element clicked wasn't the div; hide the div
      divToHide.classList.add("hidden");
    }
    else{
      divToHide.classList.toggle("hidden");
    }
  };
};

function pageData(count, page, limit) {
    return {
      recordCount: count,
      pageLimit: limit,
      get firstPage(){
        return this.middlePage - 1;
      },
      middlePage: page,
      get lastPage(){
          if((this.recordCount/this.pageLimit) - this.middlePage > 0){
            return this.middlePage + 1;
          }
          return 0;
      }
    };
  }