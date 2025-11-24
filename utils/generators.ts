
// --- SORTING ---
export function* bubbleSortGenerator(arr: number[]) {
  const len = arr.length;
  let swapped;
  let array = [...arr];
  let sortedIndices: number[] = [];

  yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: "Starting Bubble Sort..." };

  for (let i = 0; i < len; i++) {
    swapped = false;
    for (let j = 0; j < len - i - 1; j++) {
      yield { 
        array: [...array], 
        highlights: [j, j + 1], 
        sortedIndices: [...sortedIndices],
        description: `Comparing ${array[j]} and ${array[j+1]}` 
      };

      if (array[j] > array[j + 1]) {
        let temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        swapped = true;
        yield { 
          array: [...array], 
          highlights: [j, j + 1], 
          sortedIndices: [...sortedIndices],
          description: `Swapped ${array[j]} and ${array[j+1]}` 
        };
      }
    }
    // The last element of this pass is now sorted
    sortedIndices.push(len - i - 1);
    
    yield { 
      array: [...array], 
      highlights: [], 
      sortedIndices: [...sortedIndices],
      description: `Element at index ${len - i - 1} is in final position.` 
    };

    if (!swapped) {
        // If no swaps occurred, the rest of the array is sorted
        for (let k = 0; k < len - i - 1; k++) {
            if (!sortedIndices.includes(k)) sortedIndices.push(k);
        }
        break;
    }
  }
  // Ensure all are marked sorted at the end
  for(let i=0; i<len; i++) {
      if(!sortedIndices.includes(i)) sortedIndices.push(i);
  }
  yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: "Bubble Sort Complete!", completed: true };
}

export function* selectionSortGenerator(arr: number[]) {
    const len = arr.length;
    let array = [...arr];
    let sortedIndices: number[] = [];
    
    yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: "Starting Selection Sort..." };

    for (let i = 0; i < len; i++) {
        let min = i;
        yield { array: [...array], highlights: [i], sortedIndices: [...sortedIndices], description: `Current minimum index: ${i}` };
        
        for (let j = i + 1; j < len; j++) {
            yield { array: [...array], highlights: [min, j], sortedIndices: [...sortedIndices], description: `Checking ${array[j]} < ${array[min]}?` };
            if (array[j] < array[min]) {
                min = j;
                yield { array: [...array], highlights: [min], sortedIndices: [...sortedIndices], description: `Found new minimum: ${array[min]}` };
            }
        }
        if (min !== i) {
            let temp = array[i];
            array[i] = array[min];
            array[min] = temp;
            yield { array: [...array], highlights: [i, min], sortedIndices: [...sortedIndices], description: `Swapped new minimum to position ${i}` };
        }
        sortedIndices.push(i);
        yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: `Index ${i} sorted.` };
    }
    yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: "Selection Sort Complete!", completed: true };
}

export function* insertionSortGenerator(arr: number[]) {
    let array = [...arr];
    const len = array.length;
    let sortedIndices: number[] = [];
    
    yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: "Starting Insertion Sort..." };

    for (let i = 1; i < len; i++) {
        let key = array[i];
        let j = i - 1;
        yield { array: [...array], highlights: [i], sortedIndices: [...sortedIndices], description: `Selected key: ${key}` };

        while (j >= 0 && array[j] > key) {
            yield { array: [...array], highlights: [j, j+1], sortedIndices: [...sortedIndices], description: `Moving ${array[j]} forward` };
            array[j + 1] = array[j];
            j = j - 1;
            yield { array: [...array], highlights: [j+1], sortedIndices: [...sortedIndices], description: "Shift complete" };
        }
        array[j + 1] = key;
        yield { array: [...array], highlights: [j+1], sortedIndices: [...sortedIndices], description: `Inserted ${key} at correct position` };
    }

    // Mark all as sorted only at the end for Insertion Sort
    sortedIndices = Array.from({length: len}, (_, i) => i);
    yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: "Insertion Sort Complete!", completed: true };
}

export function* quickSortGenerator(arr: number[]) {
    let array = [...arr];
    let sortedIndices: number[] = [];
    
    yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: "Starting Quick Sort..." };
    
    // We pass the sortedIndices array reference to be updated
    yield* quickSortRecursive(array, 0, array.length - 1, sortedIndices);
    
    // Ensure completeness
    if (sortedIndices.length !== arr.length) {
         sortedIndices = Array.from({length: arr.length}, (_, i) => i);
    }
    yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: "Quick Sort Complete!", completed: true };
}

function* quickSortRecursive(array: number[], low: number, high: number, sortedIndices: number[]): Generator<any> {
    if (low < high) {
        const pi = yield* partition(array, low, high, sortedIndices);
        
        // Pivot 'pi' is now at its final place
        if (!sortedIndices.includes(pi)) sortedIndices.push(pi);
        yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: `Pivot ${array[pi]} locked in position` };

        yield* quickSortRecursive(array, low, pi - 1, sortedIndices);
        yield* quickSortRecursive(array, pi + 1, high, sortedIndices);
    } else if (low === high) {
        // Single element is sorted
        if (!sortedIndices.includes(low)) sortedIndices.push(low);
        yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: `Element ${array[low]} sorted` };
    }
}

function* partition(array: number[], low: number, high: number, sortedIndices: number[]): Generator<any> {
    const pivot = array[high];
    yield { array: [...array], highlights: [high], sortedIndices: [...sortedIndices], description: `Pivot chosen: ${pivot}` };
    let i = (low - 1);

    for (let j = low; j < high; j++) {
        yield { array: [...array], highlights: [j, high], sortedIndices: [...sortedIndices], description: `Comparing ${array[j]} vs Pivot ${pivot}` };
        if (array[j] < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
            yield { array: [...array], highlights: [i, j], sortedIndices: [...sortedIndices], description: `Swapping ${array[i]} and ${array[j]}` };
        }
    }
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    yield { array: [...array], highlights: [i+1, high], sortedIndices: [...sortedIndices], description: "Moving pivot to correct position" };
    return i + 1;
}

export function* mergeSortGenerator(arr: number[]) {
    let array = [...arr];
    let sortedIndices: number[] = [];

    yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: "Starting Merge Sort..." };
    yield* mergeSortRecursive(array, 0, array.length - 1, sortedIndices);
    
    // At end of merge sort, everything is sorted
    sortedIndices = Array.from({length: arr.length}, (_, i) => i);
    yield { array: [...array], highlights: [], sortedIndices: [...sortedIndices], description: "Merge Sort Complete!", completed: true };
}

function* mergeSortRecursive(array: number[], left: number, right: number, sortedIndices: number[]): Generator<any> {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    yield* mergeSortRecursive(array, left, mid, sortedIndices);
    yield* mergeSortRecursive(array, mid + 1, right, sortedIndices);
    yield* merge(array, left, mid, right, sortedIndices);
}

function* merge(array: number[], left: number, mid: number, right: number, sortedIndices: number[]): Generator<any> {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
        yield { array: [...array], highlights: [left + i, mid + 1 + j], sortedIndices: [...sortedIndices], description: `Merging: Comparing ${leftArr[i]} and ${rightArr[j]}` };
        if (leftArr[i] <= rightArr[j]) {
            array[k] = leftArr[i];
            i++;
        } else {
            array[k] = rightArr[j];
            j++;
        }
        k++;
        yield { array: [...array], highlights: [k-1], sortedIndices: [...sortedIndices], description: "Placed smaller element" };
    }

    while (i < leftArr.length) {
        array[k] = leftArr[i];
        i++;
        k++;
        yield { array: [...array], highlights: [k-1], sortedIndices: [...sortedIndices], description: "Placing remaining left elements" };
    }
    while (j < rightArr.length) {
        array[k] = rightArr[j];
        j++;
        k++;
        yield { array: [...array], highlights: [k-1], sortedIndices: [...sortedIndices], description: "Placing remaining right elements" };
    }
}
