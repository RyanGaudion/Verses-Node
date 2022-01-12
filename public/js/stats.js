function yearGraphApp(inputData) {
    return {
      chartHeight: 200,
      get maxValue(){
          return Math.max.apply(Math, this.chartData);
      },
      chartData: inputData.map(a => a.count),
      labels: inputData.map(a => a.month.substring(0,3)),

      tooltipContent: '',
      tooltipOpen: false,
      tooltipX: 0,
      tooltipY: 0,
      showTooltip(e) {
        console.log(e);
        this.tooltipContent = e.target.textContent
        this.tooltipX = e.x < (window.innerWidth / 2) ? e.target.offsetLeft : e.target.offsetLeft - 80;
        this.tooltipY = e.target.children[0].clientHeight + e.target.children[0].clientWidth;
      },
      hideTooltip(e) {
        this.tooltipContent = '';
        this.tooltipOpen = false;
        this.tooltipX = 0;
        this.tooltipY = 0;
      }
    }
  }

  //Input [OTUniqueChapters, NTUniqueChapters]
function progressGraphApp(inputData){
  return{
    OTTotal: inputData[0],
    get OTPercentage(){
      return (this.OTTotal / 929) * 100;
    },
    get OTPercentageText(){
      return Math.round(this.OTPercentage * 100) / 100
    },
    NTTotal: inputData[1],
    get NTPercentage(){
      return (this.NTTotal / 260) * 100;
    },
    get NTPercentageText(){
      return Math.round(this.NTPercentage * 100) / 100
    },
    Total: inputData[0] + inputData[1],
    get TotalPercentage(){
      return (this.Total / 1189) * 100;
    },
    get TotalPercentageText(){
      return Math.round(this.TotalPercentage * 100) / 100
    },
  }
}