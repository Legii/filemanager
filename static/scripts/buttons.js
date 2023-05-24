const handleDeleteClick = (path) => {
    let x = prompt("Usunąć ")
    if(x) {
        window.location.href="/delete/?path="+ path 
    }
}