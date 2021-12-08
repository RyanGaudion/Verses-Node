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
        this.tooltipX = e.target.offsetLeft - e.target.clientWidth;
        this.tooltipY = e.target.clientHeight + e.target.clientWidth;
      },
      hideTooltip(e) {
        this.tooltipContent = '';
        this.tooltipOpen = false;
        this.tooltipX = 0;
        this.tooltipY = 0;
      }
    }
  }