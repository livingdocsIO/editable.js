/*
  This is a binary search algorithm implementation aimed at finding a character offset position
  in a consecutive strings of characters over several lines.
  Refer to this page in order to learn more about binary search: https://en.wikipedia.org/wiki/Binary_search_algorithm

  The method takes a setup of methods to perform the partioning and returns an offset if one was found.
  Due to maintain good performance in the Browser we limited the binary search partitions to 30. This should be enough for most cases
  of paragraph content.

  @param {Function} moveLeft control how a left movement in binary search works
  @param {Function} leftCondition control when a left movement in binary search should be performed
  @param {Function} moveRight control how a right movement in binary search works
  @param {Function} upCondition control when the binary searc should move up one line (internally left movement)
  @param {Function} downCondition control when the binary search should move down one line (internally right movement)
  @param {Function} convergenceChecker returns true if the binary search converged on a value (considered a break condition)
  @param {Function} foundChecker returns true if the target position has been found with binary search (considered a break condition)
  @param {Funciton} createCursorAtCharacterOffset method that can apply the binary search offset to a real cursor (returns coordinates)
  @param {Function} data data that is passed with the different methods

  @return {Object} object with boolean `wasFound` indicating if the binary search found an offset and `offset` to indicate the actual character offset
*/
function binaryCursorSearch ({moveLeft, leftCondition, moveRight, upCondition, downCondition, convergenceChecker, foundChecker, createCursorAtCharacterOffset, data}) {
  const history = []
  const bluriness = 5
  let found = false
  for (let i = 0; i < 30; i++) {
    history.push(data.currentOffset)
    if (convergenceChecker(history)) break
    const cursor = createCursorAtCharacterOffset({element: data.element, offset: data.currentOffset})
    // up / down axis
    if (upCondition({data, cursor})) {
      moveLeft(data)
      continue
    } else if (downCondition({data, cursor})) {
      moveRight(data)
      continue
    }

    const coordinates = cursor.getCoordinates()
    const distance = Math.abs(coordinates.left - data.origCoordinates.left)
    if (foundChecker({distance, bluriness})) {
      found = true
      break
    }
    // left / right axis
    if (leftCondition({data, coordinates})) {
      moveLeft(data)
    } else {
      moveRight(data)
    }
  }

  return {wasFound: found, offset: data.currentOffset}
}

module.exports = {binaryCursorSearch}
