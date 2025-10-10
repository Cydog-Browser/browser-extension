// switch to send request for HTTPSecure
window.addEventListener("DOMContentLoaded", (event) => {
    chrome.storage.local.get((item) => {
        const automaticToggle = document.getElementById("automatic-toggle");
        const automaticToggle2 = document.getElementById("automatic-toggle2");
        const automaticToggle3 = document.getElementById("automatic-toggle3");
        const automaticToggle4 = document.getElementById("automatic-toggle4");
        //const automaticToggle5 = document.getElementById("automatic-toggle5");
        var automaticObj = item.automaticObj;
        var automaticObj2 = item.automaticObj2;
        var automaticObj3 = item.automaticObj3;
        var automaticObj4 = item.automaticObj4;
        //var automaticObj5 = item.automaticObj5;

        if (automaticObj == undefined) {
            automaticToggle.checked = true;
        } else {
            automaticToggle.checked = automaticObj.isAutomatic;
        }
        
        if (automaticObj2 == undefined) {
            automaticToggle2.checked = true;
        } else {
            automaticToggle2.checked = automaticObj2.isAutomatic2;
        }

        if (automaticObj3 == undefined) {
            automaticToggle3.checked = true;
        } else {
            automaticToggle3.checked = automaticObj3.isAutomatic3;
        }

        if (automaticObj4 == undefined) {
            automaticToggle4.checked = true;
        } else {
            automaticToggle4.checked = automaticObj4.isAutomatic4;
        }

        /*if (automaticObj5 == undefined) {
            automaticToggle5.checked = true;
        } else {
            automaticToggle5.checked = automaticObj5.isAutomatic5;
        }*/

        automaticToggle.addEventListener("change", (event) => {
            console.log("1 checked...");
            if (document.getElementById("automatic-toggle").checked) {
                let automaticObj = { isAutomatic: true };
                chrome.storage.local.set({automaticObj});
            } else {
                let automaticObj = { isAutomatic: false };
                chrome.storage.local.set({automaticObj});
            }
        });
        
        automaticToggle2.addEventListener("change", (event) => {
            if (document.getElementById("automatic-toggle2").checked) {
                let automaticObj2 = { isAutomatic2: true };
                chrome.storage.local.set({automaticObj2});
            } else {
                let automaticObj2 = { isAutomatic2: false };
                chrome.storage.local.set({automaticObj2});
            }
        });

        automaticToggle3.addEventListener("change", (event) => {
            if (document.getElementById("automatic-toggle3").checked) {
                let automaticObj3 = { isAutomatic3: true };
                chrome.storage.local.set({automaticObj3});
            } else {
                let automaticObj3 = { isAutomatic3: false };
                chrome.storage.local.set({automaticObj3});
            }
        });

        automaticToggle4.addEventListener("change", (event) => {
            if (document.getElementById("automatic-toggle4").checked) {
                let automaticObj4 = { isAutomatic4: true };
                chrome.storage.local.set({automaticObj4});
            } else {
                let automaticObj4 = { isAutomatic4: false };
                chrome.storage.local.set({automaticObj4});
            }
        });

        /*automaticToggle5.addEventListener("change", (event) => {
            if (document.getElementById("automatic-toggle5").checked) {
                let automaticObj5 = { isAutomatic5: true };
                chrome.storage.local.set({automaticObj5});
            } else {
                let automaticObj5 = { isAutomatic5: false };
                chrome.storage.local.set({automaticObj5});
            }
        });*/

        // Tab switching functionality
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all tabs and contents
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                btn.classList.add('active');
                
                // Show corresponding content
                const tabId = btn.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
        
    });
});

const getCurrentTab = async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  console.log(tab);
  return tab;
};

const sendMessageToContentScript = async (msg) => {
  let tab = await getCurrentTab();
  chrome.tabs.sendMessage(tab.id, msg);
};

//document.addEventListener('contextmenu', event => event.preventDefault());
