// Constants
const socket = io()
const submit_btn = document.getElementById('submit_btn')

const loadHomePage = () =>  {
    window.location.href = "https://thecabindepot.ca";
};

// Functions/utilities
const setStyle = (objId, propertyObject) => {
    var elem = document.getElementById(objId)
    for (var property in propertyObject) {
        elem.style[property] = propertyObject[property]
    }
}

const getElementPos = (obj) => {
    var currenttop = 0
    if (obj.offsetParent) {
        do {
            currenttop += obj.offsetTop
        } while ((obj = obj.offsetParent))
        return [currenttop]
    }
}

const scrollToApply = () => {
    window.scroll({
        top: getElementPos(document.getElementById("app_process_outer")),
        behavior: "smooth",
    })
}

const setBtnToLoading = (btn) => {
    btn.innerText = "Loading..."
    btn.style.background = 'black'
}

const setBtnToSuccess = (btn) => {
    btn.innerText = "Success!"
    btn.style.background = 'green'
}

const setBtnToFailure = (btn) => {
    btn.innerText = "Please try again"
    btn.style.background = 'red'
    setTimeout(function () {
        setBtnToDefault(btn)
    }, 1000)
}

const focusOnInput = (el_id) => {
    setStyle(el_id, {'border':'3px solid #dd8181', 'boxShadow':'none'});
    document.getElementById('send-err').innerHTML = "<b>Error</b>. You must complete all fields tagged with a *."
}

const positionSidebar = (resize) => {
    const lastKnownScrollPosition = window.scrollY
    let ticking = false
    if (!ticking) {
        const sticky_id = document.getElementById("sticky")
        let width = window.innerWidth
        if (width > 1150) {
            let height = window.innerHeight
            window.requestAnimationFrame(() => {
                let x = document.getElementById("body_content").offsetHeight - height
                let y = lastKnownScrollPosition
                if (x < y) {
                    if (sticky_id.classList.contains('fixed') || resize) {
                        sticky_id.classList.remove("fixed")
                        sticky_id.classList.add("absolute")
                        sticky_id.style.top = (document.getElementById("body_content").offsetHeight - sticky_id.offsetHeight + 1) + "px"
                    }
                } else {
                    if (sticky_id.classList.contains('absolute')) {
                        sticky_id.classList.remove("absolute")
                        sticky_id.classList.add("fixed")
                        sticky_id.style.top = 0
                    }
                }
                ticking = false
            })
        } else {
            if (sticky_id.classList.contains('absolute')) {
                sticky_id.classList.remove("absolute")
                sticky_id.classList.add("fixed")
                console.log("Sidebar now fixed")
                sticky_id.style.top = 0
            }
        }
        ticking = true
    }
}

const adjustMobileBannerSize = () => {
    if (document.body.clientWidth < 768) {
        wrapper_el = document.getElementsByClassName("mobile_img_banner_wrapper")[0]
        wrapper_el.style.height = document.getElementsByClassName("mob_banner_inner")[0].offsetHeight + "px"
    }
}

// Page behaviour
positionSidebar(true)
window.onload = adjustMobileBannerSize
addEventListener("scroll", () => positionSidebar(false))
addEventListener("resize", () => {
    adjustMobileBannerSize()
    positionSidebar(true)
})
addEventListener("load", () => {
    adjustMobileBannerSize()
    positionSidebar(true)
})

submit_btn.onclick = () => {
    fname = document.getElementById('first_name_input').value
    lname = document.getElementById('last_name_input').value
    phone = document.getElementById('phone_input').value
    email = document.getElementById('email_input').value
    add1 = document.getElementById('address1_input').value
    where = document.getElementById('where_input').value
    why = document.getElementById('why_input').value
    comments = document.getElementById('comments_input').value
    if (fname.length === 0 || lname.length === 0 || phone.length === 0 || email.length === 0
        || add1.length === 0 || where.length === 0 || why.length === 0 || comments.length === 0) {
        if (fname.length === 0) focusOnInput('first_name_input')
        if (lname.length === 0) focusOnInput('last_name_input')
        if (phone.length === 0) focusOnInput('phone_input')
        if (email.length === 0) focusOnInput('email_input')
        if (add1.length === 0) focusOnInput('address1_input')
        if (where.length === 0) focusOnInput('where_input')
        if (why.length === 0) focusOnInput('why_input')
        if (comments.length === 0) focusOnInput('comments_input')
    } else {
        setBtnToLoading(submit_btn)
        socket.emit('insert_entry', fname, lname, phone, email, add1, where, why, comments)
    }
}

socket.on('insert_entry_return', (res) => {
    if (res[1]) {
        setBtnToSuccess(submit_btn)
    } else {
        setBtnToFailure(submit_btn)
    }
})