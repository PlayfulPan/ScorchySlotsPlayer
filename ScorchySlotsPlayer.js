// ==UserScript==
// @name         Scorchy Slots Player
// @version      1.0
// @description  Automatically plays Scorchy Slots until you turn it off or your pet gets tired
// @author       Pan
// @homepage    https://github.com/PlayfulPan/ScorchySlotsPlayer
// @downloadURL https://raw.githubusercontent.com/PlayfulPan/ScorchySlotsPlayer/refs/heads/main/ScorchySlotsPlayer.js
// @updateURL https://raw.githubusercontent.com/PlayfulPan/ScorchySlotsPlayer/refs/heads/main/ScorchySlotsPlayer.js
// @match        https://www.neopets.com/games/slots.phtml*
// @grant GM_setValue
// @grant GM_getValue
// @grant GM.setValue
// @grant GM.getValue
// @grant GM_deleteValue
// @grant GM_openInTab
// ==/UserScript==

(function () {
    'use strict';

    const minClickTiming = 750;
    const maxClickTiming = 1500;

    function delay() {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve(); // Signal that the operation is complete
            }, Math.round(minClickTiming + Math.random() * (maxClickTiming - minClickTiming)));
        });
    }

    // Function to get the current slot names
    function getCurrentSlotNames() {
        const table = document.querySelector('table[align="center"][cellpadding="3"]');

        if (!table) {
            console.log('Table not found.');
            return [];
        }

        const rows = table.querySelectorAll('tr');

        if (rows.length < 2) {
            console.log('Not enough rows in the table.');
            return [];
        }

        // Select the second row
        const secondRow = rows[1]; // Zero-based index

        // Get all cells in the second row
        const cells = secondRow.querySelectorAll('td');

        // Array to hold the slot names
        const slotNames = [];

        // Loop through each cell to extract the image source and map to symbol name
        cells.forEach((cell, index) => {
            const img = cell.querySelector('img');
            if (img) {
                let src = img.getAttribute('src');
                // Clean up the src if needed
                src = src.replace('//images.neopets.com/games/slots/', '');
                const symbolName = getSymbolName(src);
                slotNames.push(symbolName);
            }
        });

        // Now you have an array of slot names
        console.log('Current Slot Names:', slotNames);

        return slotNames;
    }

    // Function to map image filenames to symbol names
    function getSymbolName(src) {
        const symbolMapping = {
            // Cherries
            'cherry_0.gif': 'Cherry',
            'cherry_1.gif': 'Cherry',
            'cherry_2.gif': 'Cherry',
            'cherry_3.gif': 'Cherry',
            // Strawberries
            'strawberry_0.gif': 'Strawberry',
            'strawberry_1.gif': 'Strawberry',
            'strawberry_2.gif': 'Strawberry',
            'strawberry_3.gif': 'Strawberry',
            // Grapes
            'grapes_0.gif': 'Grape',
            'grapes_1.gif': 'Grape',
            'grapes_2.gif': 'Grape',
            'grapes_3.gif': 'Grape',
            // Melons
            'melon_0.gif': 'Melon',
            'melon_1.gif': 'Melon',
            'melon_2.gif': 'Melon',
            'melon_3.gif': 'Melon',
            // Apples
            'apple_0.gif': 'Apple',
            'apple_1.gif': 'Apple',
            'apple_2.gif': 'Apple',
            'apple_3.gif': 'Apple',
            // Peaches
            'peach_0.gif': 'Peach',
            'peach_1.gif': 'Peach',
            'peach_2.gif': 'Peach',
            'peach_3.gif': 'Peach',
            // Bells
            'bell_0.gif': 'Bell',
            'bell_1.gif': 'Bell',
            'bell_2.gif': 'Bell',
            'bell_3.gif': 'Bell',
            // Bags of Gold
            'baggold_0.gif': 'Bag of Gold',
            'baggold_1.gif': 'Bag of Gold',
            'baggold_2.gif': 'Bag of Gold',
            'baggold_3.gif': 'Bag of Gold',
            // Map Pieces
            'mappiece_0.gif': 'Map Piece',
            'mappiece_1.gif': 'Map Piece',
            'mappiece_2.gif': 'Map Piece',
            'mappiece_3.gif': 'Map Piece',
            // Faeries
            'faerie_0.gif': 'Faerie',
            'faerie_1.gif': 'Faerie',
            'faerie_2.gif': 'Faerie',
            'faerie_3.gif': 'Faerie',
        };
        return symbolMapping[src] || 'Unknown';
    }

    function decideHoldCheckboxesBasedOnRanking() {
        const slotNames = getCurrentSlotNames(); // Get current slot names

        const symbolRanking = {
            'Cherry': 1,
            'Strawberry': 2,
            'Grape': 3,
            'Melon': 4,
            'Apple': 5,
            'Peach': 6,
            'Bell': 7,
            'Bag of Gold': 8,
            'Faerie': 9,
            'Map Piece': 10,
        };

        const holdIndices = [];
        let maxRank = 0;


        // Map each slot symbol to its rank
        const slotRanks = slotNames.map(symbol => symbolRanking[symbol] || 0);

        // Determine the maximum rank among the slots
        maxRank = Math.max(...slotRanks);

        // If maxRank is 0, no known symbols are present
        if (maxRank === 0) {
            console.log('No valuable symbols found to hold.');
            return;
        }

        // Collect the indices of slots that have the maximum rank
        slotRanks.forEach((rank, index) => {
            if (rank === maxRank) {
                holdIndices.push(index);
            }
        });

        return holdIndices;
    }


    // Run the main function when the page loads
    window.addEventListener('load', async function () {
        const isRunning = await GM.getValue('isRunning', false)

        let playAgainButton = document.querySelector('input[type="submit"][value="Play Again"]');

        if (!playAgainButton) {
            playAgainButton = document.querySelector('input[type="submit"][value="Collect Winnings"]');
        }

        console.log(playAgainButton);

        if (playAgainButton) {
            const customButton = document.createElement('input');
            customButton.type = 'button';

            if (isRunning) {
                customButton.value = 'Disable Autoplay';
            } else {
                customButton.value = 'Enable Autoplay';
            }


            customButton.style.cssText = playAgainButton.style.cssText;
            customButton.className = playAgainButton.className;

            playAgainButton.parentNode.insertBefore(customButton, playAgainButton.nextSibling);

            customButton.addEventListener('click', async function () {
                if (isRunning) {
                    await GM.deleteValue('isRunning');
                } else {
                    await GM.setValue('isRunning', true);
                }
                location.reload();
            });
            console.log('Custom button added immediately after the "Play Again" button.');
        } else {
            console.log('"Play Again" button not found.');
        }

        if (isRunning) {
            const checkboxes = document.querySelectorAll('input[type="checkbox"][name^="hold"]');
            if (checkboxes.length > 0) {
                const holdIndices = decideHoldCheckboxesBasedOnRanking();
                console.log(holdIndices);
                holdIndices.forEach((i) => {
                    checkboxes[i].checked = true;
                });
            }
            await delay();
            if (playAgainButton && isRunning) {
                playAgainButton.click();
            } else {
                await GM.deleteValue('isRunning');
            }
        }


    });

})();
