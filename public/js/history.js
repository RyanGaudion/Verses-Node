const deleteClick = (id) => {
    var deletePopup = document.getElementById("deletePopup");
    document.getElementById('recordIdInput').value = id;
    deletePopup.classList.remove("hidden");
}

const cancelClick = () => {
    var deletePopup = document.getElementById("deletePopup");
    deletePopup.classList.add("hidden");
}