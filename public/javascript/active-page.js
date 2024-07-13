const path = window.location.pathname
var dashboard = document.getElementById("Dashboard")
var permissions = document.getElementById("permissions")
var items = document.getElementById("items")
var purchase = document.getElementById("purchase")
var size = document.getElementById("size")
var sell = document.getElementById("sell")
var storage = document.getElementById("storage")
var analysis = document.getElementById("analysis")
var dailyMoney = document.getElementById("dailyMoney")

if(path == "/"){
    dashboard.style.borderStyle = "solid"
    dashboard.style.borderTop = "none"
    dashboard.style.borderLeft = "none"
    dashboard.style.borderRight = "none"
    dashboard.style.width = "80%"
    dashboard.style.borderColor = "#2e86ea8e"
    dashboard.style.transform = "scale(1.1)"
    dashboard.style.color = "#000"
}

if(path.includes("/permissions")){
    permissions.style.borderStyle = "solid"
    permissions.style.borderTop = "none"
    permissions.style.borderLeft = "none"
    permissions.style.borderRight = "none"
    permissions.style.width = "80%"
    permissions.style.borderColor = "#2e86ea8e"
    permissions.style.transform = "scale(1.1)"
    permissions.style.color = "#000"
}

if(path.includes("/items")){
    items.style.borderStyle = "solid"
    items.style.borderTop = "none"
    items.style.borderLeft = "none"
    items.style.borderRight = "none"
    items.style.width = "80%"
    items.style.borderColor = "#2e86ea8e"
    items.style.transform = "scale(1.1)"
    items.style.color = "#000"
}

if(path.includes("/purchase")){
    purchase.style.borderStyle = "solid"
    purchase.style.borderTop = "none"
    purchase.style.borderLeft = "none"
    purchase.style.borderRight = "none"
    purchase.style.width = "80%"
    purchase.style.borderColor = "#2e86ea8e"
    purchase.style.transform = "scale(1.1)"
    purchase.style.color = "#000"
}

if(path.includes("/size")){
    size.style.borderStyle = "solid"
    size.style.borderTop = "none"
    size.style.borderLeft = "none"
    size.style.borderRight = "none"
    size.style.width = "80%"
    size.style.borderColor = "#2e86ea8e"
    size.style.transform = "scale(1.1)"
    size.style.color = "#000"
}

if(path.includes("/sell")){
    sell.style.borderStyle = "solid"
    sell.style.borderTop = "none"
    sell.style.borderLeft = "none"
    sell.style.borderRight = "none"
    sell.style.width = "80%"
    sell.style.borderColor = "#2e86ea8e"
    sell.style.transform = "scale(1.1)"
    sell.style.color = "#000"
}

if(path.includes("/storage")){
    storage.style.borderStyle = "solid"
    storage.style.borderTop = "none"
    storage.style.borderLeft = "none"
    storage.style.borderRight = "none"
    storage.style.width = "80%"
    storage.style.borderColor = "#2e86ea8e"
    storage.style.transform = "scale(1.1)"
    storage.style.color = "#000"
}

if(path.includes("/analysis")){
    analysis.style.borderStyle = "solid"
    analysis.style.borderTop = "none"
    analysis.style.borderLeft = "none"
    analysis.style.borderRight = "none"
    analysis.style.width = "80%"
    analysis.style.borderColor = "#2e86ea8e"
    analysis.style.transform = "scale(1.1)"
    analysis.style.color = "#000"
}

if(path.includes("/dailymoney")){
    dailyMoney.style.borderStyle = "solid"
    dailyMoney.style.borderTop = "none"
    dailyMoney.style.borderLeft = "none"
    dailyMoney.style.borderRight = "none"
    dailyMoney.style.width = "80%"
    dailyMoney.style.borderColor = "#2e86ea8e"
    dailyMoney.style.transform = "scale(1.1)"
    dailyMoney.style.color = "#000"
}