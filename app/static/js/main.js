const addListModal = document.getElementById('addListModal')

document.body.ontouchend = function() { document.getElementById('addListModal').focus() }

document.addEventListener('DOMContentLoaded', function () {
    const list_elements = document.querySelectorAll('.list-delete-button') 
    list_elements.forEach(element => {
        const id_list = element.getAttribute('id-list')
        element.addEventListener('click', function() {
            deleteList(id_list)
        })
    })

})


addListModal.addEventListener('shown.bs.modal', function () {
    setTimeout(function() {
      input.focus()
      input.click()
    }, 200)
})


// async function addNewList(){
//     try {
//         const response = await fetch('/updatelistname', {
//             method: 'PATCH',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({'id': listID, 'name': inputListName.value})
//         })
//     return await response.json()
//     } catch (error) {
//         console.error('Err (updateListName):', error)
//     }
// }

async function deleteList(id_list){
    const response = await fetch('/deletelist', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: id_list })
    });

    if (!response.ok){
        const errorMessage = await response.text();
        throw new Error(`Err (deleteList): ${response.status} - ${errorMessage}`)
    }

    const list_element = document.querySelector(`li[id-list="${id_list}"]`)
    if (list_element){
        list_element.remove()
    }

}