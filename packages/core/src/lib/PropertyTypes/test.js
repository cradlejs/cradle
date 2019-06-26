/**
 * @param {Object} options the args object
 * @param {number} options.alpha first number
 * @param {number} options.bravo second number
 * @param {Function} callback the callback function
 * @returns {number}
 */
function addNumbersFromObject({ alpha = 1, bravo = 2 } = {}, callback = null) {
  if (!callback) {
    return alpha + bravo
  }
  return callback(alpha + bravo)
}

console.log(addNumbersFromObject({ alpha: 2 }))
