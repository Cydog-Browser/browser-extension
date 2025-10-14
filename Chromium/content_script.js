// content_script.js - Cydog Browser Browser Extension
// https://cydogbrowser.com
// Cydog is here to help. Our ultra security browsing mode now leverages our cy-cache.js available at https://github.com/Cydog-Browser/cy-cache-js
var fingerprintActual = "";
var isAutomatic = true;
var isAutomatic2 = true;
var isAutomatic3 = true;
var isAutomatic4 = true;
var isAutomatic5 = true;
var isAutomatic6 = true;

chrome.storage.local.get((item) => {

    var automaticObj = item.automaticObj;
    var automaticObj2 = item.automaticObj2;
	var automaticObj3 = item.automaticObj3;
	var automaticObj4 = item.automaticObj4;
	var automaticObj5 = item.automaticObj5;
	var automaticObj6 = item.automaticObj6;

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

	if (automaticObj5 == undefined) {
        isAutomatic5 = true;
    } else {
        isAutomatic5 = automaticObj5.isAutomatic5;
    }

	if (automaticObj6 == undefined) {
        isAutomatic6 = true;
    } else {
        isAutomatic6 = automaticObj6.isAutomatic6;
    }

	// Check if in deterrent encryptor program
	checkForDeterrence();

	new Fingerprint2().get(function(result, components){
		if(item.fingerprint !== result){
			showToast("Fingerprint changed.");
		}
		fingerprintActual = result;
		chrome.storage.local.set({'fingerprint': fingerprintActual}, function() {
			if (chrome.runtime.lastError) {
			  console.error("Cydog failed to calculate your fingerprint:", chrome.runtime.lastError.message);
			} else {
			  console.warn('Cydog calculated your fingerprint.');
			}
		});
	});
    
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
		const ENCRYPTION_KEY_EXT_CACHE = 'q7aHtbBnUyeqZJlQ';
					
		// Database setup
		const DB_NAME_EXT_CACHE = 'CydogExtensionCacheDB';
		const STORE_NAME_EXT_CACHE = 'CydogExtensionCacheStore';
		const CACHE_DURATION_EXT_CACHE = 30 * 60 * 1000; // 30 minutes in milliseconds

		// Initialize database
		let db_ext_cache;
		const initDB_ext_cache = new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME_EXT_CACHE, 1);
			
			request.onupgradeneeded = (event) => {
				db_ext_cache = event.target.result;
				if (!db_ext_cache.objectStoreNames.contains(STORE_NAME_EXT_CACHE)) {
					db_ext_cache.createObjectStore(STORE_NAME_EXT_CACHE, { keyPath: 'url' });
				}
			};
			
			request.onsuccess = async (event) => {
				db_ext_cache = event.target.result;
				resolve(db_ext_cache);
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
				new TextEncoder().encode(ENCRYPTION_KEY_EXT_CACHE),
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
				new TextEncoder().encode(ENCRYPTION_KEY_EXT_CACHE),
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
				await initDB_ext_cache;
				const encrypted = await encryptData(content);
				const transaction = db_ext_cache.transaction(STORE_NAME_EXT_CACHE, 'readwrite');
				const store = transaction.objectStore(STORE_NAME_EXT_CACHE);
				
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
				await initDB_ext_cache;
				const transaction = db_ext_cache.transaction(STORE_NAME_EXT_CACHE, 'readonly');
				const store = transaction.objectStore(STORE_NAME_EXT_CACHE);
				const request = store.get(url);
				
				return new Promise((resolve, reject) => {
					request.onsuccess = () => {
						if (request.result) {
							// Check cache expiration
							const age = Date.now() - request.result.timestamp;
							if (age < CACHE_DURATION_EXT_CACHE) {
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
				const transaction = db_ext_cache.transaction(STORE_NAME_EXT_CACHE, 'readonly');
				const store = transaction.objectStore(STORE_NAME_EXT_CACHE);
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
						var links = doc.getElementsByTagName("a");
						for (var i = 0; i < links.length; i++) {
							links[i].setAttribute("target", "_blank");
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
										max-width: 500px;
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
													const DB_NAME_EXT_CACHE = 'CydogExtensionCacheDB';
													const STORE_NAME_EXT_CACHE = 'CydogExtensionCacheStore';
													let db_ext_cache;
													const request = indexedDB.open(DB_NAME_EXT_CACHE, 1);
			
													request.onupgradeneeded = (event) => {
														db_ext_cache = event.target.result;
														if (!db_ext_cache.objectStoreNames.contains(STORE_NAME_EXT_CACHE)) {
															db_ext_cache.createObjectStore(STORE_NAME_EXT_CACHE, { keyPath: 'url' });
														}
													};
													
													request.onsuccess = async (event) => {
														db_ext_cache = event.target.result;
														try {
															const url = window.location.href;
															const transaction = db_ext_cache.transaction(STORE_NAME_EXT_CACHE, 'readwrite');
															const store = transaction.objectStore(STORE_NAME_EXT_CACHE);
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
										<iframe id="cydog-cache"></iframe>
									</div>
								</div>
							</body>
						</html>`);
					document.close();
					const cydogCache = document.getElementById('cydog-cache');
					cydogCache.srcdoc = doc.documentElement.outerHTML;
					//const iframeDocument = cydogCache.contentWindow.document;
					//iframeDocument.open();
					//iframeDocument.write(doc.documentElement.outerHTML);
					//iframeDocument.close();
					const newState = { page: 'cydog-cache', pageId: Math.random() };
					history.pushState(newState, document.title, url);
					console.warn("Cydog served cache with cycache.js through DB.");
					showToast("Cache rendered.");
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
	if (isAutomatic5) {
		conductHREFChanges();
	}
	if (isAutomatic6 && !isAutomatic5) {
		conductHREFChanges();
	}
	function conductHREFChanges(){
		window.onload = function() {
			var domainListAA;
			var domainListAB;
			var domainListAC;
			var counter = 0;
			document.querySelectorAll('a[href]').forEach(link => {
				if (location.hostname !== new URL(link.href).hostname) {
					if (isAutomatic5) {
						link.setAttribute('target', '_blank');
						link.setAttribute('rel', 'noopener noreferrer nofollow');
					}
					link.addEventListener('mouseenter', async function() {
						const linkDiv = document.createElement("div");
						linkDiv.id = `cydog-toolkit-${counter}`;
						linkDiv.innerHTML += `<p>${link.href}</p>`;
						linkDiv.style.display = 'block'; 
						var bgColor = "#fff";
						var fontHexColor = "#000";
						var borderHexColor = "#e0e0e0";
						const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
						if (prefersDarkScheme.matches) {
							bgColor = "#0a192f";
							fontHexColor = "#fff";
							borderHexColor = "#2a3a5c";
						}
						linkDiv.style.cssText = `
							position: fixed;
							top: 0;
							left: 0;
							width: auto;
							height: auto;
							background-color: ${bgColor};
							color: ${fontHexColor};
							padding: 8px 12px;
							border-radius: 4px;
							border: 1px solid ${borderHexColor};
							font-size: 14px;
							z-index: 1000;
							transform: none;
							word-break: break-all;
						`;
						const targetRect = link.getBoundingClientRect();
						linkDiv.style.position = 'absolute';
						linkDiv.style.top = (targetRect.bottom + window.scrollY + 5) + 'px';
						linkDiv.style.left = (targetRect.left + window.scrollX) + 'px';
						link.addEventListener('mouseleave', function() {
							linkDiv.remove();
							const cydogTooltips = document.querySelectorAll(`[id^='cydog-toolkit-']`);
							cydogTooltips.forEach(cydogtooltip => {
								cydogtooltip.remove();
							});
						});
						if (isAutomatic6) {
							try {
								if(domainListAA !== undefined && domainListAB !== undefined && domainListAC !== undefined){
									const urlObject = new URL(link.href);
									const domain = urlObject.hostname;;
									if (domainListAA.toString().includes(domain) || domainListAB.toString().includes(domain) || domainListAC.toString().includes(domain)) {
										linkDiv.innerHTML += renderWarning(domain);
									} else {
										linkDiv.innerHTML += renderNotListed();
									}
								} else {
									const response = await fetch('https://raw.githubusercontent.com/mdbench/malicious-domains/refs/heads/main/full-domains-aa.txt');
									if (!response.ok) {
										throw new Error(`Cydog could not get domains list response.`);
									}
									const text = await response.text();
									domainListAA = text.toString();
									const response2 = await fetch('https://raw.githubusercontent.com/mdbench/malicious-domains/refs/heads/main/full-domains-ab.txt');
									if (!response2.ok) {
										throw new Error(`Cydog could not get domains list response.`);
									}
									const text2 = await response2.text();
									domainListAB = text2.toString();
									const response3 = await fetch('https://raw.githubusercontent.com/mdbench/malicious-domains/refs/heads/main/full-domains-ac.txt');
									if (!response3.ok) {
										throw new Error(`Cydog could not get domains list response.`);
									}
									const text3 = await response3.text();
									domainListAC = text3.toString();
									const urlObject = new URL(link.href);
									const domain = urlObject.hostname;
									if (text.toString().includes(domain) || text2.toString().includes(domain) || text3.toString().includes(domain)) {
										linkDiv.innerHTML += renderWarning(domain);
									} else {
										linkDiv.innerHTML += renderNotListed();
									}
								}
							} catch (error) {
								console.error(`Cydog was unable to check domain:`, error);
							}
							function renderNotListed(){
								return `
									<p>✓ Not listed on <a href="https://github.com/romainmarcoux/malicious-domains" target="_blank">romainmarcoux's malicious list</a></p>
								`;
							}
							function renderWarning(domain){
								return `
									<p>⚠ Warning a partial match was listed on <a href="https://github.com/romainmarcoux/malicious-domains" target="_blank">romainmarcoux's malicious list</a>.</p>
									<p>You should be careful when visiting pages like this one, as versions of this domain are being actively attacked in the wild.</p>
									<p>Here are some variants to be on the lookout for:</p>
										<ul style="margin-bottom:20px;list-style:none;">
											<li>-${domain}</li>
											<li>.[blended text]-${domain}</li>
											<li>[blended text].[more blended text]-${domain}</li>
										</ul>
								`;
							}
							document.body.appendChild(linkDiv);
						} else {
							document.body.appendChild(linkDiv);
						}
					});
					counter++;
				}
			});
			if(isAutomatic5){
				// Inform user
				console.warn("Cydog made your browsing more private with de-identification techniques.");
			}
			if(isAutomatic6){
				// Inform user
				console.warn("Cydog made your browsing more secure with malicious domain checking.");
			}
		};
	}
	// Automatically enable our deterrent encryptor checker
	var deterrentEncryptorCheck;
	async function checkForDeterrence(){
		if(document.body){
			deterrentEncryptorCheck = document.body.innerText; 
			try {
				const deJSON = JSON.parse(deterrentEncryptorCheck);
				if(!deJSON){
					console.warn("Cydog determined this page is not part of deterrent encryptor program.");
				} else {
					const decryptedHtml = await decryptHtml(deterrentEncryptorCheck, "");
					if(decryptedHtml !== null){
						const htmlRegex = /<\/?[a-z][\s\S]*>/i;
						const isHtml = htmlRegex.test(decryptedHtml);
						if(isHtml){
							renderDeterrenceHTML(decryptedHtml);
						} else {
							createPasswordModal("");
						}
					} else {
						createPasswordModal("");
					}
				}
			} catch (e) {
				console.warn("Cydog determined this page is not part of deterrent encryptor program.");
			}
		}
	}
	async function decryptHtml(encryptedData, password) {
		// Extract salt, iv, tag, and ciphertext
		const encryptedDataJSON = JSON.parse(encryptedData);
		const ciphertext = Uint8Array.from(atob(encryptedDataJSON.ciphertext), c => c.charCodeAt(0));
		const iv = Uint8Array.from(atob(encryptedDataJSON.iv), c => c.charCodeAt(0));
		const salt = Uint8Array.from(atob(encryptedDataJSON.salt), c => c.charCodeAt(0));
		const tag = Uint8Array.from(atob(encryptedDataJSON.tag), c => c.charCodeAt(0));
		// Derive key from password and salt using PBKDF2
		const passwordKey = await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(password),
			{ name: 'PBKDF2' },
			false,
			['deriveKey']
		);
		const aesKey = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: salt,
				iterations: 10000,
				hash: 'SHA-256',
			},
			passwordKey,
			{ name: 'AES-GCM', length: 256 },
			false,
			['decrypt']
		);
		try {
			// Decrypt the ciphertext
			const decryptedContent = await crypto.subtle.decrypt(
				{
					name: 'AES-GCM',
					iv: iv,
					additionalData: new Uint8Array(), // No additional data used in PHP example
					tagLength: 128, // 16 bytes * 8 bits/byte = 128 bits
				},
				aesKey,
				new Uint8Array([...ciphertext, ...tag]) // Combine ciphertext and tag for decryption
			);
			return new TextDecoder().decode(decryptedContent);
		} catch (error) {
			//console.error("Decryption failed:", error);
			return null;
		}
	}
	function createPasswordModal(message) {
		var darkMode = false;
		var bgColor = "#fff";
		var bgModal = "#fff"
		var fontHexColor = "#000";
		var borderHexColor = "#e0e0e0";
		var inputBGColor = "#fff";
		const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
		if (prefersDarkScheme.matches) {
			darkMode = true;
			bgColor = "#0a192f";
			bgModal = "#1a2a4f";
			fontHexColor = "#fff";
			borderHexColor = "#2a3a5c";
			inputBGColor = "#0a192f";
		}
		// Create overlay div
		const overlay = document.createElement('div');
		overlay.id = 'modalOverlay';
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: ${bgColor};
			color: ${fontHexColor};
			display: flex;
			flex-flow: column;
			justify-content: center;
			align-items: center;
			z-index: 1000;
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		`;
		// Create branding content div
		const kbs = getStringSizeInKB(deterrentEncryptorCheck);
		const brand = document.createElement('div');
		brand.id = 'brand';
		brand.style.cssText = `
			position: fixed;
			top: 0;
			display: flex;
			flex-flow: row;
			justify-content: start;
			align-items: center;
			margin-left: 20px;
			margin-top: 20px;
			width: 100%;
			max-width: 900px;
			height: auto;
			background-color: ${bgModal};
			padding: 10px;
    		border-radius: 10px;
		`;
		brand.innerHTML = `
			<img src="https://cydogbrowser.com/static/images/logot.png" width="54px" height="65px">
			<h2>Cydog Deterrent Checker</h2>
			<p style="margin-left: auto;background-color: ${bgColor};padding: 9px;border-radius: 4px;">Size: ${kbs}KBs</p>
		`;
		// Create modal content div
		const modal = document.createElement('div');
		modal.id = 'passwordModal';
		modal.style.cssText = `
			background-color: ${bgModal};
			padding: 30px;
			border-radius: 8px;
			box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
			text-align: center;
			width: 300px;
			max-width: 90%;
			position: relative;
		`;
		// Create close button
		const closeBtn = document.createElement('span');
		closeBtn.innerHTML = '&times;';
		closeBtn.style.cssText = `
			position: absolute;
			top: 10px;
			right: 15px;
			font-size: 24px;
			cursor: pointer;
			color: #aaa;
		`;
		closeBtn.addEventListener('click', () => {
			document.body.removeChild(overlay);
		});
		// Create title
		const title = document.createElement('h2');
		title.textContent = 'Enter Password';
		title.style.marginBottom = '20px';
		// Create password input
		const passwordInput = document.createElement('input');
		passwordInput.type = 'password';
		passwordInput.placeholder = 'Password';
		passwordInput.style.cssText = `
			width: calc(100% - 20px);
			padding: 10px;
			margin-bottom: 20px;
			color: ${fontHexColor};
			background-color: ${inputBGColor};
			border: 1px solid ${borderHexColor};
			border-radius: 4px;
		`;
		// Create error message div
		var errorMessage;
		if(message !== ""){
			errorMessage = document.createElement('div');
			errorMessage.id = 'message';
			errorMessage.innerText = message;
			errorMessage.style.cssText = `
				color: #fff;
				margin-bottom: 20px;
				font-weight: 300;
				background-color: ${bgColor};
				width: 100%;
				padding: 5px;
				border-radius: 8px;
			`;
		}
		// Create submit button
		const submitBtn = document.createElement('button');
		submitBtn.textContent = 'Submit';
		submitBtn.style.cssText = `
			background-color: #2d7ff9;
			color: white;
			padding: 10px 20px;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-size: 16px;
		`;
		submitBtn.addEventListener('click', async () => {
			const password = passwordInput.value;
			const decryptedHtml = await decryptHtml(deterrentEncryptorCheck, password);
			const htmlRegex = /<\/?[a-z][\s\S]*>/i;
			const isHtml = htmlRegex.test(decryptedHtml);
			if(isHtml){
				renderDeterrenceHTML(decryptedHtml);
			} else {
				document.body.removeChild(overlay);
				createPasswordModal("There was an error.");
				showToast("Password incorrect!");
			}
		});
		modal.appendChild(closeBtn);
		modal.appendChild(title);
		modal.appendChild(passwordInput);
		if(message !== ""){
			modal.appendChild(errorMessage);
		}
		modal.appendChild(submitBtn);
		overlay.appendChild(brand);
		overlay.appendChild(modal);
		document.body.appendChild(overlay);
		// Internal functions for password modal
		function getStringSizeInKB(str) {
			const encoder = new TextEncoder();
			const byteArray = encoder.encode(str);
			const byteSize = byteArray.length;
			const kbSize = byteSize / 1024;
			return kbSize;
		}
	}
	function renderDeterrenceHTML(html){
		document.open();
		document.write(`
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body {
						width:100vw;
						height: 100vh;
						margin: 0;
						overflow: hidden;
					}
					#cydog-deterrence-encryptor {
						width: 100vw;
						height: 100vh;
						display: flex;
						flex-direction: column;
						border: none;
					}
				</style>
				<body>
					<iframe id="cydog-deterrence-encryptor"></iframe>
				</body>
			</html>`);
		document.close();
		const cydogDeterrenceEncryptor = document.getElementById('cydog-deterrence-encryptor');
		cydogDeterrenceEncryptor.srcdoc = html;
	}
	function showToast(message) {
		const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
		var bgColor = "#fff";
		var fontHexColor = "#000";
		if (prefersDarkScheme.matches) {
			bgColor = "#0a192f";
			fontHexColor = "#fff";
		}
        const toast = document.createElement('div');
        toast.textContent = message;
		toast.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = `${bgColor}`;
        toast.style.color = `${fontHexColor}`;
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease-in-out';
        toast.style.fontSize = '16px';
        toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 3000);
    }
})
