// content_script.js - Cydog Browser Browser Extension
// https://cydogbrowser.com
// Cydog is here to help. Our ultra security browsing mode now leverages our cy-cache.js available at https://github.com/Cydog-Browser/cy-cache-js

var isAutomatic = true;
var isAutomatic2 = true;
var isAutomatic3 = true;
var isAutomatic4 = true;
//var isAutomatic5 = true;

chrome.storage.local.get((item) => {

    var automaticObj = item.automaticObj;
    var automaticObj2 = item.automaticObj2;
	var automaticObj3 = item.automaticObj3;
	var automaticObj4 = item.automaticObj4;
	//var automaticObj5 = item.automaticObj5;

    if (automaticObj == undefined) {
        isAutomatic = true;
    } else {
        isAutomatic = automaticObj.isAutomatic;
    }
    
    if (automaticObj2 == undefined) {
        isAutomatic2 = true;
    } else {
        isAutomatic2 = automaticObj2.isAutomatic2;
    }

	if (automaticObj3 == undefined) {
        isAutomatic3 = true;
    } else {
        isAutomatic3 = automaticObj3.isAutomatic3;
    }

	if (automaticObj4 == undefined) {
        isAutomatic4 = true;
    } else {
        isAutomatic4 = automaticObj4.isAutomatic4;
    }

	/*if (automaticObj5 == undefined) {
        isAutomatic5 = true;
    } else {
        isAutomatic5 = automaticObj5.isAutomatic5;
    }*/
    
    if (isAutomatic) {
    	var handledURL = window.location.href;
    	if (!handledURL.match("https://")){
			var newURL = handledURL.replace("http://","");
			newURL.replace("https://","");
			newURL = "https://" + newURL;
			window.location.replace(newURL);  
			// Inform user
			console.warn("Cydog secured your browser with an HTTPSecure upgrade.");
    	}
    }
    		
    if (isAutomatic2) {
    	
		function addHTMLSecurity(){
			// Cache control
			var link = document.createElement('meta');  
			link.setAttribute('http-equiv', 'cache-control');  
			link.content = 'no-cache';  
			document.getElementsByTagName('head')[0].appendChild(link);

			var link2 = document.createElement('meta');  
			link2.setAttribute('http-equiv', 'expires');  
			link2.content = '0';  
			document.getElementsByTagName('head')[0].appendChild(link2);

			var link3 = document.createElement('meta');  
			link3.setAttribute('http-equiv', 'pragma');  
			link3.content = 'no-cache';  
			document.getElementsByTagName('head')[0].appendChild(link3);
			
			// Referrer control
			var link4 = document.createElement('meta');  
			link4.setAttribute('name', 'referrer');  
			link4.content = 'origin';  
			document.getElementsByTagName('head')[0].appendChild(link4);
			
			var link5 = document.createElement('meta');  
			link5.setAttribute('name', 'referrer');  
			link5.content = 'unsafe-url';  
			document.getElementsByTagName('head')[0].appendChild(link5);
			
			var link6 = document.createElement('meta');  
			link6.setAttribute('name', 'referrer');  
			link6.content = 'no-referrer-when-downgrade';  
			document.getElementsByTagName('head')[0].appendChild(link6);
			
			var link7 = document.createElement('meta');  
			link7.setAttribute('name', 'referrer');  
			link7.content = 'origin-when-cross-origin';  
			document.getElementsByTagName('head')[0].appendChild(link7);
			
			// Security control
			var link8 = document.createElement('meta');  
			link8.setAttribute('name', 'security');  
			link8.content = 'captivedataurl; noxbl; noxsitesubmit; pagelevelpwd';  
			document.getElementsByTagName('head')[0].appendChild(link8);
			
			// Content security policy
			var link9 = document.createElement('meta');  
			link9.setAttribute('http-equiv', 'Content-Security-Policy');  
			link9.content = "upgrade-insecure-requests;";  
			document.getElementsByTagName('head')[0].appendChild(link9);
		}

		// Encryption key management
		const ENCRYPTION_KEY = 'q7aHtbBnUyeqZJlQ';
					
		// Database setup
		const DB_NAME = 'CydogExtensionCacheDB';
		const STORE_NAME = 'CydogExtensionCacheStore';
		const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

		// Initialize database
		let db;
		const initDB = new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, 1);
			
			request.onupgradeneeded = (event) => {
				db = event.target.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME, { keyPath: 'url' });
				}
			};
			
			request.onsuccess = async (event) => {
				db = event.target.result;
				resolve(db);
				try{
					getCachedPage(window.location.href);
				} catch {
					addHTMLSecurity();
					window.onload = function() {
						const contentCache = document.documentElement.outerHTML;
						cachePage(window.location.href, contentCache);
					};
				}
			};
			
			request.onerror = (event) => {
				reject('IndexedDB error: ' + event.target.error);
			};
		});

		// Encryption/decryption functions
		async function encryptData(data) {
			const encoder = new TextEncoder();
			const dataBuffer = encoder.encode(data);
			
			const iv = crypto.getRandomValues(new Uint8Array(12));
			const key = await crypto.subtle.importKey(
				'raw',
				new TextEncoder().encode(ENCRYPTION_KEY),
				{ name: 'AES-GCM' },
				false,
				['encrypt']
			);
			
			const encrypted = await crypto.subtle.encrypt(
				{ name: 'AES-GCM', iv },
				key,
				dataBuffer
			);
			
			return {
				iv: Array.from(iv),
				encrypted: Array.from(new Uint8Array(encrypted))
			};
		}

		async function decryptData(encryptedData) {
			const { iv, encrypted } = encryptedData;
			const ivBuffer = new Uint8Array(iv).buffer;
			const encryptedBuffer = new Uint8Array(encrypted).buffer;
			
			const key = await crypto.subtle.importKey(
				'raw',
				new TextEncoder().encode(ENCRYPTION_KEY),
				{ name: 'AES-GCM' },
				false,
				['decrypt']
			);
			
			const decrypted = await crypto.subtle.decrypt(
				{ name: 'AES-GCM', iv: ivBuffer },
				key,
				encryptedBuffer
			);
			
			return new TextDecoder().decode(decrypted);
		}

		// Cache management functions
		async function cachePage(url, content) {
			try {
				await initDB;
				const encrypted = await encryptData(content);
				const transaction = db.transaction(STORE_NAME, 'readwrite');
				const store = transaction.objectStore(STORE_NAME);
				
				store.put({
					url,
					content: encrypted,
					timestamp: Date.now()
				});
			} catch (error) {
				console.error('Cydog caching error:', error);
			}
		}

		async function getCachedPage(url) {
			try {
				await initDB;
				const transaction = db.transaction(STORE_NAME, 'readonly');
				const store = transaction.objectStore(STORE_NAME);
				const request = store.get(url);
				
				return new Promise((resolve, reject) => {
					request.onsuccess = () => {
						if (request.result) {
							// Check cache expiration
							const age = Date.now() - request.result.timestamp;
							if (age < CACHE_DURATION) {
								resolve(request.result);
							} else {
								// Cache expired
								resolve(null);
								window.onload = function() {
									const contentCache = document.documentElement.outerHTML;
									cachePage(window.location.href, contentCache);
								};
							}
						} else {
							resolve(null);
							window.onload = function() {
								const contentCache = document.documentElement.outerHTML;
								cachePage(window.location.href, contentCache);
							};
						}
					};
					request.onerror = () => reject(request.error);
				});
			} catch (error) {
				console.error('Cydog cache retrieval error:', error);
				return null;
			}
		}

		async function refreshCachedPage() {
			try {
				const url = window.location.href;
				const transaction = db.transaction(STORE_NAME, 'readonly');
				const store = transaction.objectStore(STORE_NAME);
				const deleteRequest = store.delete(url);

				deleteRequest.onsuccess = function() {
					window.location.reload();
				};

				deleteRequest.onerror = function(event) {
					console.error('Cydog cache deletion error:', event.target.errorCode);
				};
				
			} catch (error) {
				console.error('Cydog cache deletion error:', error);
			}
		}

		// Check cache
		checkCSPBeforeRender();
		async function checkCSPBeforeRender(){
			try {
				const response = await fetch(window.location.href);
				const csp = response.headers.get('Content-Security-Policy');
				//console.warn(`Cydog found headers of ${csp}`);
				if(csp === null || window.location.href.includes('duckduckgo.com')) {
					renderCache();
				}
			  } catch (error) {
				console.error(`Error fetching CSP header for ${window.location.href}:`, error);
			  }
		}
		async function renderCache(){
			const url = window.location.href;
			try {
				const urlObject = new URL(url);
				const domain = urlObject.hostname;
				const cached = await getCachedPage(url);
				if (cached) {
					const decryptedContent = await decryptData(cached.content);
					var darkMode = "";
					const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
					if (prefersDarkScheme.matches) {
						darkMode = "dark-mode";
					}
					const parser = new DOMParser();
					const doc = parser.parseFromString(decryptedContent, 'text/html');
					if(doc.body.innerHTML === ""){
						return;
					}
					if(url.includes("duckduckgo.com")){
						const headerNonNav = doc.getElementById('header-non-nav');
						headerNonNav.remove();
						const footer = doc.querySelectorAll('.footer');
						footer[0].remove();
						const moreResults = doc.getElementById('more-results');
						moreResults.remove();
						const dataState = doc.querySelectorAll('[data-state]');
						dataState[2].remove();
						const moreDropdown = doc.querySelector('[tabindex="0"]');
						moreDropdown.remove();
						const polyFill = doc.querySelectorAll('[data-hide-untill-css-vars-polyfilled]');
						polyFill[1].remove();
						const navHeaders = doc.querySelectorAll('nav');
						navHeaders[1].remove();
						const reactLayout = doc.getElementById('react-layout');
						reactLayout.style.paddingTop = "15px";
						const articles = doc.querySelectorAll('article');
						articles.forEach(article => {
							const buttons = article.querySelectorAll('button');
							buttons.forEach(button => {
								button.remove();
							});
						});
						const headerNav = doc.getElementById('header');
						const headerWrapper = doc.getElementById('header_wrapper');
						const relatedSearchesItems = doc.querySelectorAll('.related-searches__item');
						const siteWrapper = doc.querySelector('.site-wrapper');
						if(darkMode === "dark-mode"){
							headerNav.style.backgroundColor = "#0a192f";
							headerWrapper.style.backgroundColor = "#0a192f";
							reactLayout.style.backgroundColor = "#152547";
							siteWrapper.style.backgroundColor = "#152547";
							relatedSearchesItems.forEach(relatedSearchesItem => {
								relatedSearchesItem.style.backgroundColor = "#0a192f";
								relatedSearchesItem.style.borderColor = "deepskyblue";
							});
							const styleElement = doc.createElement('style');
							styleElement.innerHTML = `
								*::before {
									background-image: none !important;
								}
							`;
							doc.head.appendChild(styleElement);
						} else {
							headerNav.style.backgroundColor = "#ffffff";
							headerWrapper.style.backgroundColor = "#ffffff";
							reactLayout.style.backgroundColor = "#ffffff";
							siteWrapper.style.backgroundColor = "#ffffff";
							relatedSearchesItems.forEach(relatedSearchesItem => {
								relatedSearchesItem.style.backgroundColor = "#ffffff";
								relatedSearchesItem.style.borderColor = "deepskyblue";
							});
							const styleElement = doc.createElement('style');
							styleElement.innerHTML = `
								*::before {
									background-image: none !important;
								}
							`;
							doc.head.appendChild(styleElement);
						}
					}
					const numberOfScripts = doc.scripts.length;
					const numberOfImages = doc.images.length;
					const numberOfLinks = doc.links.length;
					document.open();
					document.write(`
						<!DOCTYPE html>
						<html>
							<head>
								<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
								<style>
									:root {
										--bg-primary: #ffffff;
										--bg-secondary: #f0f2f5;
										--text-primary: #1a1a1a;
										--text-secondary: #4d4d4d;
										--accent-blue: #0066ff;
										--border-color: #d0d0d0;
										--shadow: 0 4px 12px rgba(0,0,0,0.1);
									}
									.dark-mode {
										--bg-primary: #0a192f;
										--bg-secondary: #152547;
										--text-primary: #f0f0f0;
										--text-secondary: #b0b0b0;
										--border-color: #2a3a5c;
										--shadow: 0 4px 12px rgba(0,0,0,0.3);
									}
									* {
										margin: 0;
										padding: 0;
										transition: background-color 0.3s, color 0.3s;
									}
									body {
										width:100vw;
										height: 100vh;
										margin: 0;
										overflow: hidden;
										font-family: 'Segoe UI', system-ui, sans-serif;
										line-height: 1.6;
										overflow-x: hidden;
										background-color: var(--bg-primary);
										color: var(--text-primary);
									}
									.iframe-container {
										width: 100vw;
										height: 100vh;
										display: flex;
										flex-direction: column;
									}
									.top-bar {
										display:flex;
										justify-content: start;
										align-items: center;
										gap:10px;
										height:50px;
										padding: 10px;
										flex-shrink: 0;
										background-color: var(--bg-primary);
										color: var(--text-primary);
										border-bottom: 1px solid var(--border-color);
									}
									.top-bar h3 {
										font-size: 1.8em;
										font-family: 'Segoe UI', system-ui, sans-serif;
										font-weight:100;
									}
									.theme-toggle {
										background: none;
    									border: none;
    									cursor: pointer;
    									font-size: 1.5rem;
    									color: inherit;
									}
									.search-container {
										margin-left: auto;
										width: 50%;
										background-color: var(--bg-primary);
										color: var(--text-primary);
										border-radius: 16px;
										box-shadow: var(--shadow);
									}
									.search-box {
										display: flex;
									}
									#search-input {
										flex: 1;
										padding: 14px 20px;
										border: 2px solid var(--border-color);
										border-radius: 50px 0 0 50px;
										font-size: 1rem;
										outline: none;
										background-color: var(--bg-primary);
										color: var(--text-primary);
										box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
									}
									#search-input:focus {
										border-color: var(--accent-blue);
									}
									#search-btn {
										background-color: var(--accent-blue);
										color: var(--text-primary);
										color: white;
										border: none;
										border-radius: 0 50px 50px 0;
										padding: 0 30px;
										font-size: 1rem;
										font-weight: 600;
										cursor: pointer;
										transition: background 0.2s;
									}
									#search-btn:hover {
										background: #0055dd;
									}
									.side-bar {
										position: fixed;
										left: 0;
										top: 70px;
										background-color: var(--bg-primary);
										color: var(--text-primary);
										width: 99px;
										height: 100%;
										flex-shrink: 0;
										border-top: 1px solid var(--border-color);
										border-right: 1px solid var(--border-color);
									}
									ul {
										padding: 10px;
									}
									ul li {
										display: flex;
										flex-flow: column;
										justify-content: center;
										align-items: center;
										gap: 5px;
										box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
										transition: transform 0.3s;
										backdrop-filter: blur(10px);
									}
										border-radius: 8px;
										padding: 10px;
									}
									button {
										display: flex;
										flex-flow: column;
										justify-content: center;
										align-items: center;
										text-decoration: none;
										border: none;
										cursor: pointer;
										background-color: var(--bg-secondary);
										color: var(--text-primary);
									}
									.main-content {
										flex: 1;
									}
									#cydog-cache {
										position: fixed;
										left: 100px;
										border: none;
										width: calc(100% - 100px);
										height: calc(100% - 70px);
										background-color: var(--bg-primary);
										color: var(--text-primary);
									}
								</style>
							</head>
							<body class="${darkMode}">
								<div class="iframe-container">
									<div class="top-bar ${darkMode}">
										<img src="https://cydogbrowser.com/static/images/logot.png" width="42px" height="50px">
										<h3>Cydog Cache Browser</h3>
										<form class="search-container" action="https://duckduckgo.com/" method="get">
											<div class="search-box">
												<input type="text" id="search-input" name="q" placeholder="Enter your DuckDuckGo query..." autocomplete="off">
												<button id="search-btn">
													<i class="fas fa-search"></i> Search
												</button>
											</div>
										</form>
										<button class="theme-toggle" onclick="(() => {
												const themeToggle = document.querySelector('.theme-toggle');
												document.body.classList.toggle('dark-mode');
												const topBar = document.querySelector('.top-bar');
												topBar.classList.toggle('dark-mode');
												const sideBar = document.querySelector('.side-bar');
												sideBar.classList.toggle('dark-mode');
											})()">
											<i class="fas fa-moon"></i>
										</button>
									</div>
									<div class="side-bar ${darkMode}">
										<ul>
											<li>
												<h3>Actions</h3>
											</li>
											<li>
												<button onclick="(() => {
													const DB_NAME = 'CydogExtensionCacheDB';
													const STORE_NAME = 'CydogExtensionCacheStore';
													let db;
													const request = indexedDB.open(DB_NAME, 1);
			
													request.onupgradeneeded = (event) => {
														db = event.target.result;
														if (!db.objectStoreNames.contains(STORE_NAME)) {
															db.createObjectStore(STORE_NAME, { keyPath: 'url' });
														}
													};
													
													request.onsuccess = async (event) => {
														db = event.target.result;
														try {
															const url = window.location.href;
															const transaction = db.transaction(STORE_NAME, 'readwrite');
															const store = transaction.objectStore(STORE_NAME);
															const deleteRequest = store.delete(url);

															deleteRequest.onsuccess = function() {
																window.location.reload();
															};

															deleteRequest.onerror = function(event) {
																console.error('Cydog cache deletion error:', event.target.errorCode);
															};
														
														} catch (error) {
															console.error('Cydog cache deletion error:', error);
														}
													};
													
													request.onerror = (event) => {
														reject('IndexedDB error: ' + event.target.error);
													};
											
												})()" title="This will remove Cydog Cache and reload page." style="width:100%;display: flex;gap:10px;flex-flow: column;justify-content: center;align-items: center;text-decoration: none;border: none;border-radius:3px;cursor: pointer;background-color: var(--accent-blue);color: #fff;padding: 10px;margin:5px;font-weight:700;">
													<i class="fa-solid fa-arrows-rotate"></i>
													<span>Refresh</span>
												</button>
											</li>
										</ul>
									</div>
									<div class="main-content">
										<iframe id="cydog-cache" sandbox="allow-scripts allow-popups allow-forms allow-same-origin"></iframe>
									</div>
								</div>
							</body>
						</html>`);
					document.close();
					const cydogCache = document.getElementById('cydog-cache');
					//cydogCache.srcdoc = decryptedContent;
					const iframeDocument = cydogCache.contentWindow.document;
					iframeDocument.open();
					iframeDocument.write(doc.documentElement.outerHTML);
					iframeDocument.close();
					const newState = { page: 'cydog-cache', pageId: Math.random() };
					history.pushState(newState, document.title, url);
					console.warn("Cydog served cache with cycache.js through DB.");
				} 
			} catch (error) {
				console.warn("Cydog could not serve cache due to malformed URL.");
			}
		}

		// Inform user
		console.warn("Cydog secured your browser with ultra security.");

    }
	
	if (isAutomatic3) {
		// Store the original getContext method
		const originalGetContext = HTMLCanvasElement.prototype.getContext;

		// Override the getContext method
		HTMLCanvasElement.prototype.getContext = function(contextType, contextAttributes) {
			if (contextType === 'webgl' || contextType === 'webgl2') {
				// Return null to prevent WebGL context creation
				console.warn('Cydog blocked a specific WebGL context.');
				return null;
			}
			// Call the original getContext for other context types (e.g., '2d')
			return originalGetContext.call(this, contextType, contextAttributes);
		};

		// Inform user
		console.warn("Cydog made your browsing more private with WebGL blocking.");
	}

	if (isAutomatic4) {
		// Tracker detection patterns
        const TRACKER_PATTERNS = [
            /pixel\.gif(\?|$)/i,
            /track(ing)?\./i,
            /(sp|tr)\.gif/i,
            /beacon\//i,
            /collect\?/i,
            /log\?/i,
            /_utm.gif/i,
            /doubleclick\.net/i
        ];

        let blockedCounter = 0;
        const blockedLog = document.getElementById('blockedLog');
        const blockedCountElement = document.getElementById('blockedCount');

        // Intercept resource loading
        document.addEventListener('beforeload', function(e) {
            const url = e.url || e.target.src;
            
            if (!url) return;
            
            // Check against tracker patterns
            const isTracker = TRACKER_PATTERNS.some(pattern => 
                pattern.test(url)
            );
            
            // Block and log if tracker detected
            if (isTracker) {
                e.preventDefault();
                console.warn(`Cydog blocked pixel tracker: ${url}`);
            }
        }, true);

        // Inform user
		console.warn("Cydog made your browsing more private with beacon blocking.");
	}
	/*if (isAutomatic5) {

		// TODO - Add more privacy features here...

		// Inform user
		console.warn("Cydog made your browsing more private with...");
	}*/
})
