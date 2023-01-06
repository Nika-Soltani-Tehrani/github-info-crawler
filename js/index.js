// variables
const userNameInput = document.querySelector('#user_id');
const submitButton = document.querySelector('.submit');
const userPhoto = document.getElementById('user_photo')
const userName = document.getElementById('user_name')
const userEmail = document.getElementById('user_email')
const userLocation = document.getElementById('user_location')
const userBio = document.getElementById('user_bio')
const userLang = document.getElementById('user_lang')
const errorDisplay = document.getElementById('error_display')


// handel username requests, if user data have been fetched from the api and have been stored in the local storage,
// the response will fetch from the local storage and if not, it results to a new api call.
async function getUserInfoFromAPI(e)
{
    clearPrevInfo()
    let name = userNameInput.value;
    e.preventDefault();
    let favLang = await findFavoriteLanguages(name)

    //checks if the user info is in the local storage or not
    let data = await JSON.parse(window.localStorage.getItem(name));

    // if user info is not in the local storage
    if (data == null)
    {
        let response = await fetch(`https://api.github.com/users/${name}`);
        console.log('get data from api call');
        // handel api errors
        if (response.status === 400) {
            errorDisplayFunction('Request failed with client error')
            return Promise.reject(`Request failed with client error ${response.status}`);
        }
        if (response.status === 500) {
            errorDisplayFunction('Request failed with server error')
            return Promise.reject(`Request failed with server error ${response.status}`);
        }
        if (response.status !== 200) {
            errorDisplayFunction('Request failed with error')
            return Promise.reject(`Request failed with error ${response.status}`);
        }
        let obj = await response.json();

        setUserInfo(obj, favLang);
        setUserInfoInLocalStorage(name, obj)
    }
    else
    {
        let user_info_object = await JSON.parse(window.localStorage.getItem(name));
        setUserInfo(user_info_object, favLang)
        console.log("Get data from local storage")
    }
    
}

// change value of user info fieldset 
function setUserInfo(obj, favLanguage)
{
    {
        if (obj.name != null)
            userName.innerHTML = obj.name
        else
            userName.innerHTML = "<span>No Name Is Provided</spane>";
    }
    {
        if (obj.location != null)
            userLocation.innerHTML = obj.location
        else
            userLocation.innerHTML = "<span>No Location Is Provided</spane>";
    }
    {
        if (obj.email != null)
            userEmail.innerHTML = obj.email
        else
            userEmail.innerHTML = "<span>No Email Address Is Provided</spane>";
    }
    {
        if (obj.bio != null)
            userBio.innerHTML = obj.bio
        else
            userBio.innerHTML = "<span>No Biography Is Provided</spane>";
    }
    {
        if (favLanguage !== null)
            userLang.innerHTML = "<span>Favorite Language Is </spane>" + favLanguage
        else
            userLang.innerHTML = "<span>Favorite Language Is Not Provided</spane>";
    }
    {
        if (obj.avatar_url != null)
            userPhoto.src = obj.avatar_url

    }

}

// create a json object to store user info to put in the local storage
function createUserObject(obj)
{
    return {
        name: obj.name,
        email: obj.email,
        location: obj.location,
        bio: obj.bio,
        avatar_url: obj.avatar_url
    }
}


// put user info in the local storage
function setUserInfoInLocalStorage(name, obj)
{
    try{
        let user_info_object = createUserObject(obj)
        window.localStorage.setItem(name, JSON.stringify(user_info_object));
    }
    catch (e)
    {
        errorDisplayFunction("Saving user data in the local storage failed.");
    }

}

//find top five favorite user languages
async function findFavoriteLanguages(username)
{
    let response = await fetch(`https://api.github.com/users/${username}/repos`);
    let langObj = await response.json();

    // get first five repos
    let firstFiveLang = langObj.slice(0, 5);
    console.log(firstFiveLang)
    let langOccurrence = firstFiveLang.reduce((a, obj)=>{
        a[obj.language] =  (a[obj.language] || 0 ) + 1;
        return a
    },{});


    let sortedLanguages = Object.keys(langOccurrence)
        .sort((a,b) => langOccurrence[b] - langOccurrence[a] )
        .slice(0,1)

    return sortedLanguages[0]
}

// clear previous user data
function clearPrevInfo()
{
    userName.innerHTML = "<span>User Name</spane>";
    userLocation.innerHTML = "<span>User Location</spane>";
    userEmail.innerHTML = "<span>User Email</spane>";
    userBio.innerHTML = "<span>User Bio</spane>";
    userPhoto.src = "./images/background.jpg";
    errorDisplay.style.display = "none";
}


// display errors which may be produced and removes the error message from screen after 5 seconds.
function errorDisplayFunction(errorMessage) {
    errorDisplay.style.display = "block";
    errorDisplay.innerHTML = "<span>" + errorMessage + "</span>";
    setTimeout(() => {
        errorDisplay.style.display = "none";
    }, 5000);
}

submitButton.addEventListener('click', getUserInfoFromAPI);
