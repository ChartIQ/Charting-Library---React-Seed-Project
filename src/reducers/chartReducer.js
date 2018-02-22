//action types
import Types from '../actions/chartActions'

//create a demo date feed
import ChartService from '../feeds/ChartService'
let service = new ChartService().makeFeed()

//initial state
const initialState = {
  ciq: null,
  service: service,
  chartType: null,
  refreshInterval: 1,
  symbol: 'AAPL',
  showDrawingToolbar: false,
  showCrosshairs: false,
  showTimezoneModal: false,
  showAxisLabels: true,
  chartSeries: [],
  comparisons: [],
  periodicity: {
    period: 1,
    interval: 1,
    timeUnit: 'day'
  },
  shareStatus: "HIDDEN",
  shareStatusMsg: null,
  showPeriodicityLoader: false,
  studyOverlay: {
    show: false,
    top: 0,
    left: 0,
    params: null
  },
  initialTool:undefined,
  drawings: [],
  oldDrawings: [],
  canUndo: false,
  canRedo: false,
  canClear: false
}

const chart = (state = initialState, action) => {
  switch (action.type) {
    case Types.SET_CONTAINER:
      let ciq = new CIQ.ChartEngine({
        container: action.container
      })
      ciq.attachQuoteFeed(state.service, { refreshInterval: state.refreshInterval })
      ciq.setMarketFactory(CIQ.Market.Symbology.factory);
      let layout = CIQ.localStorage.getItem('myChartLayout');
      if (layout !== null){
        layout = JSON.parse(layout);
        ciq.importLayout(layout, { managePeriodicity: true, cb: restoreDrawings.bind(this, ciq) });
      } else {
        ciq.newChart(state.symbol)    
      }
      let preferences = CIQ.localStorage.getItem('myChartPreferences');
      if (preferences !== null){
        preferences = JSON.parse(preferences);
        if (preferences.timeZone) {
          ciq.setTimeZone(null, preferences.timeZone);
        }
      }
      return Object.assign({}, state, {
        ciq: ciq,
        periodicity: {
          period: layout ? layout.periodicity : state.periodicity.period,
          interval: layout ? layout.interval : state.periodicity.interval,
          timeUnit: layout ? layout.timeUnit : state.periodicity.timeUnit
        },
        chartType: layout ? layout.chartType : state.chartType,
        showCrosshairs: layout ? layout.crosshair : state.showCrosshairs,
        symbol: layout && layout.symbols ? layout.symbols[0].symbol.toUpperCase() : state.symbol
      })
    case Types.SET_CHART_TYPE:
      if (action.chartType.aggregationEdit && state.ciq.layout.aggregationType != action.chartType.type) {
        state.ciq.setChartType('none');
        state.ciq.setAggregationType(action.chartType.type);
      } else {
        state.ciq.setAggregationType(action.chartType.type)
        state.ciq.setChartType(action.chartType.type)
      }
      state.ciq.draw()
      return Object.assign({}, state, {
        chartType: action.chartType.type
      })
    case Types.ADD_COMPARISON:
      let newComparisons = state.comparisons.concat([action.series]);
      return Object.assign({}, state, {
        comparisons: newComparisons
      })
    case Types.REMOVE_COMPARISON:
      newComparisons = state.comparisons.filter(comp => comp.id !== action.comparison)
      return Object.assign({}, state, {
        comparisons: newComparisons
      })
    case Types.TOGGLE_TIMEZONE_MODAL:
      return Object.assign({}, state, {
        showTimezoneModal: !state.showTimezoneModal
      })
    case Types.TOGGLE_CROSSHAIRS:
      state.ciq.layout.crosshair = !state.showCrosshairs
      return Object.assign({}, state, {
        showCrosshairs: !state.showCrosshairs
      })
    case Types.CHANGE_CHART_DATA:
      return Object.assign({}, state, {
        isLoadingPeriodicity: action.changing
      })
    case Types.CHANGE_VECTOR_PARAMS:
      let style = state.ciq.canvasStyle('stx_annotation')
      if (style) {
        state.ciq.currentVectorParameters.annotation.font.size = style.size
        state.ciq.currentVectorParameters.annotation.font.family = style.family
        state.ciq.currentVectorParameters.annotation.font.style = style.style
        state.ciq.currentVectorParameters.annotation.font.weight = style.weight
      }
      let toolbarStatus=document.getElementById('chartContainer').classList.contains('toolbarOn')
	    if(!state.initialTool) state.initialTool=action.tool;
      if(action.tool&&state.initialTool!==action.tool) state.initialTool=action.tool;
	    let tool=(!action.tool&&toolbarStatus&&state.initialTool)?state.initialTool:action.tool
      state.ciq.changeVectorType(tool)
      return state
    case Types.CHANGE_VECTOR_LINE_PARAMS:
      state.ciq.currentVectorParameters.lineWidth = action.weight
      state.ciq.currentVectorParameters.pattern = action.pattern
      return state
    case Types.CHANGE_VECTOR_STYLE:
      let type = action.styleType

      if (type === "bold") {
        state.ciq.currentVectorParameters.annotation.font.weight = !action.style.bold ? "bold" : "normal"
      } else if (type === "italic") {
        state.ciq.currentVectorParameters.annotation.font.style = !action.style.italic ? "italic" : "normal"
      } else if (type === "family") {
        state.ciq.currentVectorParameters.annotation.font.family = action.style.family
      } else if (type === "size") {
        state.ciq.currentVectorParameters.annotation.font.size = action.style.size + 'px'
      } else if (type === "lineColor") {
        state.ciq.currentVectorParameters.currentColor = CIQ.hexToRgba('#' + action.style.color)
      } else if (type === "fillColor") {
        state.ciq.currentVectorParameters.fillColor = CIQ.hexToRgba('#' + action.style.color)
      } else return state

      return state
    case Types.SET_PERIODICITY:
      return Object.assign({}, state, {
        periodicity: {
          period: action.periodicity.period,
          interval: action.periodicity.interval,
          timeUnit: action.periodicity.timeUnit
        }
      })
    case Types.SET_SYMBOL:
      return Object.assign({}, state, {
        symbol: action.symbol
      })
    case Types.SHARE_CHART:
        return state;
    case Types.SET_SHARE_STATUS:
      return Object.assign({}, state, {
          shareStatus: action.status,
          shareStatusMsg: action.msg
        })
    case Types.DRAW:
      state.ciq.draw()
      return state
    case Types.TOGGLE_AXIS_LABELS:
      let flipAxisLabels = !state.showAxisLabels;
      state.ciq.currentVectorParameters.axisLabel=flipAxisLabels;
      return Object.assign({}, state, {
        showAxisLabels: flipAxisLabels
      })
    case Types.DRAWINGS_CHANGED:
        let drawings = state.ciq.drawingObjects.slice();
        return Object.assign({}, state, {
          drawings: drawings
        });
    case Types.UNDO:
        return Object.assign({}, state, {
          oldDrawings: state.drawings,
          canRedo: true
        });
    case Types.REDO:
        return Object.assign({}, state, {
          canRedo: false,
          oldDrawings: []
        });
    // case Types.CLEAR:
    //     return Object.assign({}, state, {
    //       drawings: [],
    //       canClear: false
    //     });
    case Types.UPDATE_UNDO_STAMPS:
        return Object.assign({}, state, {
          canUndo: state.ciq.undoStamps.length > 0,
          canClear: state.ciq.drawingObjects.length > 0,
          oldDrawings: [],
          canRedo: state.oldDrawings.length>0 && state.canRedo ? false : state.canRedo
        });
    case Types.IMPORT_DRAWINGS:
        drawings = state.ciq.drawingObjects.slice();
        return Object.assign({}, state, {
          drawings: drawings,
          canClear: drawings.length > 0
        });
    default:
      return state
    }
}

/*
* private functions
*/
function restoreDrawings(stx){
  var memory=CIQ.localStorage.getItem(stx.chart.symbol);
	if(memory!==null){
    var parsed=JSON.parse(memory);
		if(parsed){
			stx.importDrawings(parsed);
			stx.draw();
		}
	}
}

export default chart
