// switch to send request for HTTPSecure
window.addEventListener("DOMContentLoaded", (event) => {
    chrome.storage.local.get((item) => {
        createModal("Cydog Toolkit is software made on behalf of Cydog Browser, a security and browser company developing new web standards.", document.getElementById("about-us"));
        const fingerprintLabel = document.getElementById("fingerprint");
        const fingerprint = item.fingerprint;
        fingerprintLabel.innerHTML += fingerprint;
        createModal("This fingerprint allows users to see their browsing sessions are not unique, despite privacy techniques. Many companies believe you can make a private web. We fundamentally disagree with this approach. Security should be the core concern of all web technologies and this is what we focus on to ensure your experience is private because its secure. We'll let you know if your fingerprint ever changes. This will help you determine if the technologies you are using actually work.", fingerprintLabel);
        const automaticToggle = document.getElementById("automatic-toggle");
        createModal("Our HTTPSecure setting upgrades insecure web links you are navigating to so you can ensure you only visit pages following secure web standards.", document.getElementById('https-secure-only'));
        const automaticToggle2 = document.getElementById("automatic-toggle2");
        createModal("Our Ultra Security browsing mode injects page security meta tags and includes standards that were never adopted by mainstream companies to secure your web experience. It also uses cycache.js as a backbone to identify web pages that are not secure because they do not follow best practices, serving them as a cache where possible. Pages served this way will recieve a take-over and you'll see our logo.", document.getElementById('ultra-security-browsing'));
        const automaticToggle3 = document.getElementById("automatic-toggle3");
        createModal("Our domain checker program gives users real-time, updated feedback on the security of pages they visit without phone-home application layers.", document.getElementById('domain-checker'));
        createModal("Our deterrence program allows web developers to create encrypted web pages that can only be decrypted by our browser extension. Click on the button to check it out!", document.getElementById('deterrent-program'));
        const automaticToggle4 = document.getElementById("automatic-toggle4");
        createModal("Some privacy technologies enable secure interactions by preventing insecure contexts. Our block WebGL feature secures the pages you visit by blocking JavaScript rendering of WebGL. This will not break WebGL, as most WebGL applications are delivered via a pre-packaged sandbox on websites.", document.getElementById('block-web-gl'));
        const automaticToggle5 = document.getElementById("automatic-toggle5");
        createModal("Web beacons are a security issue that compromises secure privacy. A web beacon can be used to track you but it will actually be used to gather an IP Address to deliver real-time inauthentic content to a user via a Man in the Middle (MitM) attack.", document.getElementById('block-web-beacons'));
        const automaticToggle6 = document.getElementById("automatic-toggle6");
        createModal("Tabs are secure but processes inside tabs to process web page content can be insecure because they allow your habits to be identified. Our de-identification strategies rely on serving users new tabs instead of coercing all connections into the same tab.", document.getElementById('inhibit-identification'));
        var automaticObj = item.automaticObj;
        var automaticObj2 = item.automaticObj2;
        var automaticObj3 = item.automaticObj3;
        var automaticObj4 = item.automaticObj4;
        var automaticObj5 = item.automaticObj5;
        var automaticObj6 = item.automaticObj6;

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

        if (automaticObj5 == undefined) {
            automaticToggle5.checked = true;
        } else {
            automaticToggle5.checked = automaticObj5.isAutomatic5;
        }

        if (automaticObj6 == undefined) {
            automaticToggle6.checked = true;
        } else {
            automaticToggle6.checked = automaticObj6.isAutomatic6;
        }

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

        automaticToggle5.addEventListener("change", (event) => {
            if (document.getElementById("automatic-toggle5").checked) {
                let automaticObj5 = { isAutomatic5: true };
                chrome.storage.local.set({automaticObj5});
            } else {
                let automaticObj5 = { isAutomatic5: false };
                chrome.storage.local.set({automaticObj5});
            }
        });

        automaticToggle6.addEventListener("change", (event) => {
            if (document.getElementById("automatic-toggle6").checked) {
                let automaticObj6 = { isAutomatic6: true };
                chrome.storage.local.set({automaticObj6});
            } else {
                let automaticObj6 = { isAutomatic6: false };
                chrome.storage.local.set({automaticObj6});
            }
        });

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

        // Set ntfy functionality
        const ntfy = document.getElementById("ntfy");
        const ntfyInput = document.getElementById("ntfy-input");
        const ntfyInput2 = document.getElementById("ntfy-input2");
        const ntfyStatus = document.getElementById("ntfy-status");
        const ntfyActual = item.ntfy;
        const ntfyActualTopic = item.ntfytopic;
        if(ntfyActual && ntfyActualTopic){
            ntfyInput.value = ntfyActual;
            ntfyInput2.value = ntfyActualTopic;
            ntfyStatus.innerHTML = "Ready to send notifications.";
        }
        ntfy.addEventListener('submit', function(event) {
            event.preventDefault();
            ntfyStatus.innerHTML = "Adding new parameters.";
            const ntfyInputValue = ntfyInput.value;
            const ntfyInputValue2 = ntfyInput2.value;
            if(ntfyInput !=="" && ntfyInput2 !==""){
                chrome.storage.local.set({ ntfy: `${ntfyInputValue}`, ntfytopic: `${ntfyInputValue2}` })
                .then(() => {
                    console.log("Cydog stored your NTFY link.");
                    ntfyStatus.innerHTML = "Ready to send notifications.";
                })
                .catch((error) => {
                    console.error("Cydog failed to store your NTFY link:", error);
                    ntfyStatus.innerHTML = "Could not save web link.";
                });
            } else {
                ntfyStatus.innerHTML = "Values cannot be empty.";
            }
        });

    });
    function createModal(message, element){
        const modal = document.createElement("div");
        modal.id = `cydog-toolkit-modal`;
        modal.innerHTML = `${message}`;
        modal.style.display = 'none'; 
        var bgColor = "#fff";
        var fontHexColor = "#000";
        var borderHexColor = "#e0e0e0";
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
        if (prefersDarkScheme.matches) {
            bgColor = "#0a192f";
            fontHexColor = "#fff";
            borderHexColor = "#2a3a5c";
        }
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: auto;
            max-width: 400px;
            height: auto;
            background-color: ${bgColor};
            color: ${fontHexColor};
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid ${borderHexColor};
            font-size: 14px;
            z-index: 1000;
            transform: none;
            word-break: break-word;
        `;
        element.addEventListener('mouseenter', async function() {
            const targetRect = element.getBoundingClientRect();
            modal.style.position = 'absolute';
            modal.style.top = (targetRect.bottom + window.scrollY + 5) + 'px';
            modal.style.left = (targetRect.left + window.scrollX) + 'px';
            document.body.appendChild(modal);
        });
        element.addEventListener('mouseleave', function() {
            modal.remove();
            const modals = document.querySelectorAll(`[id^='cydog-toolkit-modal']`);
            modals.forEach(modalActual => {
                modalActual.remove();
            });
        });
    }
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
