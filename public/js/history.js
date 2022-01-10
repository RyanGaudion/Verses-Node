//Delete Popup Delete
const deleteClick = (id) => {
    HideHistoryActionPopup();
    var deletePopup = document.getElementById("deletePopup");
    document.getElementById('recordIdInput').value = id;
    deletePopup.classList.remove("hidden");
}

//Delete Popup Cancel
const cancelClick = () => {
    var deletePopup = document.getElementById("deletePopup");
    deletePopup.classList.add("hidden");
}


//Pagination
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

//Actions Popup Tooltip
document.addEventListener('click', function(e){
  popup = document.getElementById("historyOptionPopup");
  popupBackground = document.getElementById("historyOptionPopupBackground");
  if (e.target.matches('.historyCardOptionButton, .historyCardOptionButton *')) {
      var button = e.target.closest(".historyCardOptionButton");
      var historyCard = button.parentElement.parentElement;
      
      //Set Popup ID Value
      document.getElementById("PopupViewEditID").value = historyCard.id;
      document.getElementById('PopupDeleteButton').setAttribute('onclick','deleteClick(\''+historyCard.id+'\')')



      historyCard.classList.add("z-10");
      popup.classList.remove("hidden");

      popup.style.left = (button.offsetLeft - popup.clientWidth + 20) +"px";
      popup.style.top = (button.offsetTop - popup.clientHeight) +"px"; 

      popupBackground.classList.remove("hidden");
      
  }
  else if(e.target.matches('#historyOptionPopup, #historyOptionPopup *')){
      //Do nothing
  }
  else{
    HideHistoryActionPopup();
  }
});

function HideHistoryActionPopup(){
  popup.classList.add("hidden");
  popupBackground.classList.add("hidden");

  //Remove z-10 from all history cards:
  Array.from(document.getElementsByClassName('historyCard')).forEach((el) => el.classList.remove('z-10'));
}