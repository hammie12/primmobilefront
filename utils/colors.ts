export const generateRandomColor = (): string => {
  const colors = [
    '#1a3447', '#ffc107', '#8bc34a', '#9c27b0', '#ff5722',
    '#e91e63', '#2196f3', '#4caf50', '#ff9800', '#009688',
    '#795548', '#607d8b', '#3f51b5', '#673ab7'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}; 