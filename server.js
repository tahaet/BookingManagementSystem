/* eslint-disable */ //import 'core-js/stable';
/* eslint-disable */ const $4cea2429871f7b7c$export$4c5dd147b21b9176 = (locations)=>{
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
        scrollZoom: false
    });
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc)=>{
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';
        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};


/* eslint-disable */ // import axios from 'axios';
/* eslint-disable */ const $1ae05df42fad93b4$export$516836c6a9dfc573 = ()=>{
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};
const $1ae05df42fad93b4$export$de026b00723010c1 = (type, msg)=>{
    $1ae05df42fad93b4$export$516836c6a9dfc573();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout($1ae05df42fad93b4$export$516836c6a9dfc573, 5000);
};


const $d370a3ea05852e0f$export$596d806903d1f59e = async (email, password)=>{
    try {
        const res = await fetch('http://localhost:3000/api/v1/users/login', {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        if (res.body.status === 'success') {
            (0, $1ae05df42fad93b4$export$de026b00723010c1)('success', 'Logged in successfully!');
            window.setTimeout(()=>{
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        (0, $1ae05df42fad93b4$export$de026b00723010c1)('error', err.message);
    }
};
const $d370a3ea05852e0f$export$a0973bcfe11b05c9 = async ()=>{
    try {
        const res = await fetch('http://localhost:3000/api/v1/users/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(res);
        res.status = 'success';
        location.reload(true);
    } catch (err) {
        console.log(err.response);
        (0, $1ae05df42fad93b4$export$de026b00723010c1)('error', 'Error logging out! Try again.');
    }
};


// import {   updateSettings } from './updateSettings';
// DOM ELEMENTS
const $70c75a0022cbe274$var$mapBox = document.getElementById('map');
const $70c75a0022cbe274$var$loginForm = document.querySelector('.login-form');
const $70c75a0022cbe274$var$logOutBtn = document.querySelector('.nav__el--logout');
const $70c75a0022cbe274$var$userDataForm = document.querySelector('.form-user-data');
const $70c75a0022cbe274$var$userPasswordForm = document.querySelector('.form-user-password');
// DELEGATION
if ($70c75a0022cbe274$var$mapBox) {
    const locations = JSON.parse($70c75a0022cbe274$var$mapBox.dataset.locations);
    (0, $4cea2429871f7b7c$export$4c5dd147b21b9176)(locations);
}
if ($70c75a0022cbe274$var$loginForm) $70c75a0022cbe274$var$loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    (0, $d370a3ea05852e0f$export$596d806903d1f59e)(email, password);
});
if ($70c75a0022cbe274$var$logOutBtn) $70c75a0022cbe274$var$logOutBtn.addEventListener('click', (0, $d370a3ea05852e0f$export$a0973bcfe11b05c9));
if ($70c75a0022cbe274$var$userDataForm) $70c75a0022cbe274$var$userDataForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
// updateSettings({ name, email }, 'data');
});
if ($70c75a0022cbe274$var$userPasswordForm) $70c75a0022cbe274$var$userPasswordForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    // await updateSettings(
    //   { passwordCurrent, password, passwordConfirm },
    //   'password'
    // );
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
});


//# sourceMappingURL=server.js.map
