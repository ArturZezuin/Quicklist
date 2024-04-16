const searchInput = document.getElementById('searchInput');
const textlistName = document.getElementById('textlistName');
const checkboxShowMarked = document.getElementById('checkboxShowMarked');
const listOffersWrapper = document.getElementById('listOffersWrapper');
const listOffers = document.getElementById('listOffers');
const listItemsWrapper = document.getElementById('listItemsWrapper');
const listItems = document.getElementById('listItems');
const messageToast = document.getElementById('messageToast');


window.onload = function() {
   showHideListItems();
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

function showHideListItems(){
    let messageNoItems = document.getElementById('messageNoItems');
    let messageAllMarked = document.getElementById('messageAllMarked');

    if (messageNoItems) { messageNoItems.remove() };
    if (messageAllMarked) { messageAllMarked.remove() };

    if (listItems.hasChildNodes()) {
        let allItems = 0;
        let allMarkedItems = 0;
        let children = listItems.childNodes;
        for (let i = 0; i < children.length; ++i) {
            if (children[i].nodeType == 1) {
                allItems += 1;
                let checkbox = children[i].querySelector('.form-check-input');
                if (checkbox.checked) {allMarkedItems += 1;}
                if (checkbox.checked && !checkboxShowMarked.checked) {
                    children[i].style.display = "none";
                } else {
                    children[i].style.display = "block";
                }
            }
        }

        document.getElementById('allItems').textContent = "All items: " + allItems;
        
        if (allItems == 0) {
            let div = document.createElement('div');
            div.id = "messageNoItems";
            div.className = "d-flex text-secondary text-center justify-content-center mt-3 px-2";
            div.textContent = "There's nothing here yet. Start typing";
            listItemsWrapper.appendChild(div);
            listItems.style.display = "none";

        } else if (allMarkedItems == allItems && !checkboxShowMarked.checked) {
            let div = document.createElement('div');
            div.id = "messageAllMarked";
            div.className = "d-flex text-secondary text-center justify-content-center mt-3 px-2";
            div.textContent = "All items are marked. To see all items, click on Show marked.";
            listItemsWrapper.appendChild(div);
            listItems.style.display = "none";

        } else {
            listItems.style.display = "block";   
        }
    }
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
                        showHideListItems();
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
                        showHideListItems();
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

checkboxShowMarked.onchange = function() {
    showHideListItems();   
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
    fetch('/add_list_item/' + list_id + '/' + dbItemId).then((response) => {
        if (response.status = 200){
            response.json().then((results) => {
                if (results['is_add'] == '1') {
                    let div = document.createElement('div');
                    div.setAttribute('dbItemID', dbItemId)
                    div.className = "list-group-item";
                    div.innerHTML = `
                    <div class="d-flex">
                        <div class="px-0"><input class="form-check-input me-1" type="checkbox" value="" id="listCheckbox-` + dbItemId + `"></div>
                        <div class="flex-grow-1 px-2"><label role="button" class="form-check-label" for="listCheckbox-` + dbItemId + `">` + dbItemName + `</label></div>
                        <div role="button" class="deleteListItem">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>   
                        </div>
                    </div>   
                    `;
                    listItems.appendChild(div);
                    showHideListItems();
                } else {
                    ShowToast(dbItemName + " is already on the list");
                }
            })
        }
    })
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
    div.className = "list-group-item list-group-item-action";
    listOffers.appendChild(div);  
    listOffersWrapper.style.display = "block";  
}

textlistName

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
