//Utility function to truncate text
//
export const truncateText = (text:string, maxLength:number) => {
    if (text.length <= maxLength) {
      return text; // Return the original text if it's shorter than or equal to maxLength
    } else {
      return text.slice(0, maxLength) + '...'; // Truncate and add ellipsis
    }
}