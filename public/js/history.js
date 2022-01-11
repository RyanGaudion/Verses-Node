function getActionPopup(){ return document.getElementById("historyOptionPopup"); }
function getActionPopupBackground() { return document.getElementById("historyOptionPopupBackground");}
actionRecordId = 0;
historyCard = null;
function updateActionId(id){
  historyCard = document.getElementById(id);
  actionRecordId = id;
}


//Actions Popup Tooltip
document.addEventListener('click', function(e){
  if (e.target.matches('.historyCardOptionButton, .historyCardOptionButton *')) {
    var button = e.target.closest(".historyCardOptionButton");
    var historyCard = button.parentElement.parentElement;
    updateActionId(historyCard.id);


    //Set ViewEdit Popup ID Value
    document.getElementById("PopupViewEditID").value = actionRecordId;

    //Change Popup Text
    document.getElementById('PopupBookmarkText').innerText = historyCard.querySelector('.bookmarkIcon').classList.contains("hidden") ? "Bookmark" : "Un-Bookmark";
      
    ShowActionPopup(button.offsetLeft, button.offsetTop);
  }
  else if(!e.target.matches('#historyOptionPopup, #historyOptionPopup *')){
    HideActionPopup();
  }
});

//Delete Popup Delete
const deleteClick = () => {
    var deletePopup = document.getElementById("deletePopup");
    document.getElementById('recordIdInput').value = actionRecordId;
    deletePopup.classList.remove("hidden");
    HideActionPopup();
}

//Delete Popup Cancel
const cancelClick = () => {
    var deletePopup = document.getElementById("deletePopup");
    document.getElementById('recordIdInput').value = 0;
    deletePopup.classList.add("hidden");
}

//Handle Bookmark
const bookmarkClick = async () => {
  const bookmark = await fetch('/api/record/bookmark/?recordId='+actionRecordId);
  const record = await bookmark.json();
  
  if(record.bookmarked){
    historyCard.querySelector('.bookmarkIcon').classList.remove("hidden");
    historyCard.querySelector('.bookmarkIcon').classList.add("flex");
  }
  else{
    historyCard.querySelector('.bookmarkIcon').classList.remove("flex");
    historyCard.querySelector('.bookmarkIcon').classList.add("hidden");
  }
  HideActionPopup();
};


//Pagination
function pageData(count, page, limit) {
    return {
      recordCount: count,
      pageLimit: limit,
      get firstPage(){
        return this.middlePage - 1;
      },
      middlePage: page,
      get showControls(){
        return (this.recordCount/this.pageLimit) > 1;
      },
      get lastPage(){
          if((this.recordCount/this.pageLimit) - this.middlePage > 0){
            return this.middlePage + 1;
          }
          return 0;
      }
    };
  }



function HideActionPopup(){
  
  HideActionPopupOnly();
  //actionRecordId = 0;

  //Remove z-10 from all history cards:
  Array.from(document.getElementsByClassName('historyCard')).forEach((el) => el.classList.remove('z-10'));
}

function HideActionPopupOnly(){
  popup = getActionPopup();
  popup.classList.add("hidden");
  popupBackground = getActionPopupBackground();
  popupBackground.classList.add("hidden");
}

function ShowActionPopup(offsetLeft, offsetTop){
  //Show Popup
  historyCard.classList.add("z-10");
  getActionPopup().classList.remove("hidden");

  popup = getActionPopup();

  //Move Popup
  popup.style.left = (offsetLeft - popup.clientWidth + 20) +"px";
  popup.style.top = (offsetTop - popup.clientHeight) +"px";
    
  //Show Popup Background
  getActionPopupBackground().classList.remove("hidden");
}