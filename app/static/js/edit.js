const searchInput = document.getElementById('searchInput');
const textlistName = document.getElementById('textlistName');

const listOffersWrapper = document.getElementById('listOffersWrapper');
const listOffers = document.getElementById('listOffers');
const listItemsWrapper = document.getElementById('listItemsWrapper');
const listItems = document.getElementById('listItems');
const messageToast = document.getElementById('messageToast');
const blockSettings = document.getElementById('blockSettings');
const btnSettings = document.getElementById('btnSettings');


window.onload = function() {
   showListItems();
}

function ShowToast(message) {
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(messageToast);
    let messageToastText = document.getElementById('messageToastText');
    messageToastText.textContent = message;
    toastBootstrap.show();
}


function clearOfferList(){
    listOffers.innerHTML = "";
    listOffersWrapper.style.display = "none";
}

function clearSearchInput(){
    searchInput.value = '';  
    searchInput.focus(); 
}

function showListItems(){
    let messageNoItems = document.getElementById('messageNoItems');
    if (messageNoItems) { messageNoItems.remove() };

    listItems.style.display = "block"; 

    let allListItems = listItems.querySelectorAll("div.list-group-item");
    if (allListItems.length == 0) {
        let div = document.createElement('div');
        div.id = "messageNoItems";
        div.className = "d-flex text-secondary text-center justify-content-center mt-3 px-2";
        div.textContent = "There's nothing here yet. Start typing";
        listItemsWrapper.appendChild(div);
        listItems.style.display = "none";
        return;
    }

    allListItems.forEach(function (lItem) {
        let checkbox = lItem.querySelector('.form-check-input');   
        if (checkbox.checked) {
            lItem.setAttribute('isMarked', "1");
            lItem.classList.add('bg-3');
            lItem.classList.remove('bg-2');
        } else {
            lItem.setAttribute('isMarked', "0");
            lItem.classList.add('bg-2');
            lItem.classList.remove('bg-3');
        }
    });
  
    let listElements = Array.prototype.slice.call(listItems.children);
    let sortedListElements = listElements.sort((a, b) => (+a.getAttribute("isMarked")) - (+b.getAttribute("isMarked")));
    listItems.innerHTML = '';
    sortedListElements.forEach(el => listItems.appendChild(el));
}

listItems.onclick = function(e) {
    let list_item = e.target.closest('.list-group-item');
    let dbItemId = list_item.getAttribute('dbItemID')
    if (e.target.closest('.deleteListItem') != null) {
        fetch('/delete_list_item/' + list_id + '/' + dbItemId).then((response) => {
            if (response.status = 200){
                response.json().then((results) => {
                    if (results['is_delete'] == '1') {
                        document.querySelector('[dbItemID="' + dbItemId + '"]').remove();
                        showListItems();
                    }
                })
            }
        })
    } else {
        let checkbox = list_item.querySelector('.form-check-input');
        fetch('/mark_list_item/' + list_id + '/' + dbItemId + '/' + Number(checkbox.checked)).then((response) => {
            if (response.status = 200){
                response.json().then((results) => {
                    if (results['change_marked'] == '1') {
                        showListItems();
                    }
                })
            }
        })
    }
}

textlistName.onchange = function() {
    let newName = textlistName.value;
    if (newName.length == 0 ) newName = 'New list'; 
    fetch('/change_list_name/' + list_id + '/' + newName);   
}

listOffers.onclick = function(e) {
    let dbItemID = e.target.getAttribute('dbItemID'); 
    if (dbItemID == '0') {
        addNewItem(e.target.textContent);
    }  else {
        addItemToList(dbItemID, e.target.textContent);
    }
    clearOfferList();
    clearSearchInput();
}

function addItemToList(dbItemId, dbItemName){

    let foundElement = listItems.querySelector('div[dbItemId="' + dbItemId + '"]');
    if (foundElement == null) {
        fetch('/add_list_item/' + list_id + '/' + dbItemId).then((response) => {
            if (response.status = 200){
                let div = document.createElement('div');
                div.setAttribute('dbItemID', dbItemId);
                div.setAttribute('isMarked', "0");
                div.className = "list-group-item bg-2 p-3";
                div.innerHTML = `
                <div class="d-flex fs-5">
                    <div class="px-0"><input class="form-check-input me-1" type="checkbox" value="" id="listCheckbox-` + dbItemId + `"></div>
                    <div class="flex-grow-1 px-2"><label role="button" class="form-check-label" for="listCheckbox-` + dbItemId + `">` + dbItemName + `</label></div>
                    <div role="button" class="deleteListItem">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                        </svg> 
                    </div>
                </div>   
                `;
                listItems.appendChild(div);
                showListItems();
            }    
        });   
    } else {
        let checkbox = foundElement.querySelector('.form-check-input');
        if (checkbox.checked == false) {
            ShowToast(dbItemName + " is already on the list");
        } else {
            fetch('/mark_list_item/' + list_id + '/' + dbItemId + '/' + 0).then((response) => {
                if (response.status = 200){
                    foundElement.setAttribute('isMarked', "0");
                    foundElement.classList.add('bg-2');
                    foundElement.classList.remove('bg-3');  
                    checkbox.checked = false;  
                }   
            });      
        }
    }

    showListItems();

}

function addNewItem(itemName){
    fetch('/add_item/' + itemName).then((response) => {
        if (response.status = 200){
            response.json().then((results) => {
                addItemToList(results['itemId'], itemName.toLowerCase());
                clearOfferList();
                clearSearchInput();
            })
        }
    })  
}

function addItemToOfferList(textContent, dbItemID){
    const div = document.createElement("div");
    div.textContent = textContent;
    div.setAttribute('dbItemID', dbItemID)
    div.setAttribute('role', "button")
    div.className = "list-group-item list-group-item-action bg-light p-2 fs-5";
    listOffers.appendChild(div);  
    listOffersWrapper.style.display = "block";  
}

searchInput.addEventListener('keyup', function(e) {
    if (searchInput.value.trim() == '') clearOfferList();
    
    switch (e.code){

        case 'Enter' || 'NumpadEnter':
            const itemName = searchInput.value.trim(); 
            addNewItem(itemName);
            break;

        case 'Escape':
            clearOfferList();
            clearSearchInput();
            break;

        default:
            const searchText = e.target.value.trim();
            let timerId = null;
            let lastTime = performance.now();
        
            if (searchText.length < 3) return;
            if (timerId) clearTimeout(timerId);
        
            timerId = setTimeout(() => {
                if (performance.now() - lastTime > 3) {
                    fetch('/searchitem/' + searchText)
                    .then((response) => response.json())
                    .then((results) => {
                        if (results.length > 0) {
                            clearOfferList();
                            for (let i = 0; i < results.length; i++) {
                                addItemToOfferList(results[i][1], results[i][0])
                            }
                        } else {
                            clearOfferList();
                            addItemToOfferList(searchText, 0)
                        }
                    });
                }
            }, 500);
    }
});
