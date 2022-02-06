// Generated by CoffeeScript 1.10.0
var DTTMain, Game, MinMaxSelector, NumberSelector, StartSelector, Tasks, a, assertEqual, br, button, calculateTargetTime, customize, customizeInitialState, div, dup, el, form, formatTime, game, gameInitialState, gameParamValid, gameParams, gameParamsDefaults, gameParamsInitialState, generateTask, h1, h2, h3, h4, img, input, isGtZero, label, li, local, make, option, p, parseQueryParams, pluralize, ref, render, saveDup, select, small, span, speak, store, strong, tellTask, testFormatTime, timer, trainerLogic, ul, wait,
  slice = [].slice;

local = !top.location.hostname;

gameParamsDefaults = {
  type: local ? 'seconds' : 'random',
  min: 5,
  max: 10,
  minutes: local ? 1 : 3,
  seconds: local ? 30 : 300,
  error: false,
  speechEnabled: true,
  tellTime: true
};

parseQueryParams = function() {
  return _.object(_.map(top.location.search.substr(1).split(/&/), function(kv) {
    return kv.split(/=/);
  }));
};

gameParamsInitialState = function() {
  var ref;
  return _.assign({}, gameParamsDefaults, JSON.parse(((ref = window.localStorage) != null ? ref.gameParams : void 0) || "{}"), parseQueryParams());
};

isGtZero = function(val) {
  return _.isFinite(val) && +val > 0;
};

gameParamValid = function(prop, val, state) {
  if (prop === 'random') {
    if (!(isGtZero(state.min) && isGtZero(state.max))) {
      return false;
    }
  } else {
    if (!isGtZero(val)) {
      return false;
    }
  }
  if (prop === 'min') {
    return +val <= +state.max;
  } else if (prop === 'max') {
    return +val >= +state.min;
  } else if (prop === 'random') {
    return +state.min <= +state.max;
  } else {
    return true;
  }
};

saveDup = function() {
  var newState, objs, ref;
  objs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  newState = dup.apply(null, objs);
  if ((ref = window.localStorage) != null) {
    ref.gameParams = JSON.stringify(newState);
  }
  return newState;
};

gameParams = function(state, action) {
  if (state == null) {
    state = gameParamsInitialState();
  }
  switch (action.type) {
    case 'changeType':
      return saveDup(state, {
        type: action.selected,
        error: !gameParamValid(action.selected, state[action.selected], state)
      });
    case 'changeVal':
      return saveDup(state, make(action.prop, action.val), {
        error: !gameParamValid(action.prop, action.val, state)
      });
    case 'toggleSpeech':
      return saveDup(state, {
        speechEnabled: !state.speechEnabled
      });
    case 'toggleTellTime':
      return saveDup(state, {
        tellTime: !state.tellTime
      });
    default:
      return state;
  }
};

calculateTargetTime = function() {
  var params;
  params = store.getState().gameParams;
  switch (params.type) {
    case 'random':
      return _.random(params.min * 60, params.max * 60);
    case 'minutes':
      return +params.minutes * 60;
    case 'seconds':
      return +params.seconds;
  }
};

gameInitialState = {
  started: false,
  tasks: [],
  elapsed: 0
};

game = function(state, action) {
  var elapsed, ref, rest, task;
  if (state == null) {
    state = gameInitialState;
  }
  switch (action.type) {
    case 'startGame':
      return dup(state, {
        started: true,
        target: calculateTargetTime()
      });
    case 'startCountdown':
      return dup(state, {
        countdown: 2
      });
    case 'decreaseCountdown':
      return dup(state, {
        countdown: state.countdown - 1,
        running: state.countdown === 1
      });
    case 'nextTask':
      elapsed = _.reduce(state.tasks, (function(sum, task) {
        return sum + task.elapsed;
      }), 0);
      if (elapsed < state.target) {
        task = generateTask(state.tasks[0], state.target, elapsed);
        tellTask(task);
        return dup(state, {
          tasks: [task].concat(state.tasks),
          elapsed: elapsed
        });
      } else {
        return dup(state, {
          finished: true,
          running: false,
          elapsed: elapsed
        });
      }
      break;
    case 'decreaseTask':
      ref = state.tasks, task = ref[0], rest = 2 <= ref.length ? slice.call(ref, 1) : [];
      task = dup(task, {
        time: task.time - 1
      });
      return dup(state, {
        tasks: [task].concat(rest)
      });
    case 'startAnother':
      return gameInitialState;
    default:
      return state;
  }
};

tellTask = function(task) {
  return speak(store.getState().gameParams.tellTime ? task.desc + " for " + task.time + " seconds" : task.desc);
};

wait = 0;

timer = function() {
  game = store.getState().game;
  if (!game.started) {
    return;
  }
  if (game.countdown && (!responsiveVoice.isPlaying() || wait++ > 1)) {
    wait = 0;
    return store.dispatch({
      type: 'decreaseCountdown'
    });
  } else if (game.running) {
    if (0 === game.tasks.length || 0 === game.tasks[0].time) {
      return store.dispatch({
        type: 'nextTask'
      });
    } else {
      return store.dispatch({
        type: 'decreaseTask'
      });
    }
  }
};

setInterval(timer, 1000);

NumberSelector = React.createClass({
  label: function() {
    return this.props.label || 'Value';
  },
  unit: function() {
    if (this.props.type === 'seconds') {
      return 's';
    } else {
      return 'min';
    }
  },
  render: function() {
    return div({
      className: "form-group " + (this.props.hasError ? 'has-error' : void 0)
    }, label({}, this.label() + ': '), div({
      className: 'input-group'
    }, input({
      type: 'number',
      className: "form-control",
      value: this.props.value,
      onChange: this.props.onChange,
      step: 'any',
      min: 0
    }), div({
      className: 'input-group-addon'
    }, this.unit())));
  }
});

MinMaxSelector = React.createClass({
  handleChange: function(fld, e) {
    return store.dispatch({
      type: 'changeVal',
      prop: fld,
      val: e.target.value
    });
  },
  render: function() {
    return span({}, el(NumberSelector, {
      label: 'Min',
      value: this.props.min,
      onChange: this.handleChange.bind(this, 'min'),
      hasError: this.props.error
    }), el(NumberSelector, {
      label: 'Max',
      value: this.props.max,
      onChange: this.handleChange.bind(this, 'max'),
      hasError: this.props.error
    }));
  }
});

StartSelector = React.createClass({
  changeType: function(e) {
    return store.dispatch({
      type: 'changeType',
      selected: e.target.value
    });
  },
  handleChange: function(e) {
    return store.dispatch({
      type: 'changeVal',
      prop: this.props.type,
      val: e.target.value
    });
  },
  handleCustomize: function(e) {
    e.preventDefault();
    return store.dispatch({
      type: 'customize'
    });
  },
  startGame: function(e) {
    e.preventDefault();
    if (!this.props.error) {
      return store.dispatch({
        type: 'startGame'
      });
    }
  },
  render: function() {
    return div({}, p({
      className: "lead"
    }, 'The game is not started yet. Select training time and press Start.'), form({
      className: "form-inline",
      onSubmit: this.startGame
    }, div({
      className: "form-group"
    }, label({}, 'Time: '), select({
      className: "form-control",
      defaultValue: this.props.type,
      onChange: this.changeType,
      style: {
        width: 'auto'
      }
    }, option({
      value: 'random'
    }, 'Random time'), option({
      value: 'minutes'
    }, 'Minutes'), option({
      value: 'seconds'
    }, 'Seconds'))), 'random' === this.props.type ? el(MinMaxSelector, this.props) : el(NumberSelector, {
      type: this.props.type,
      value: this.props[this.props.type],
      onChange: this.handleChange,
      hasError: this.props.error
    }), br({}), div({
      className: "form-group"
    }, label({}, input({
      type: 'checkbox',
      checked: this.props.speechEnabled,
      onChange: function() {
        return store.dispatch({
          type: 'toggleSpeech'
        });
      }
    }), ' Enable speech  ')), this.props.speechEnabled ? div({
      className: "form-group"
    }, label({}, input({
      type: 'checkbox',
      checked: this.props.tellTime,
      onChange: function() {
        return store.dispatch({
          type: 'toggleTellTime'
        });
      }
    }), ' Include task duration  ')) : void 0, br({}), button({
      type: "submit",
      className: "btn btn-primary btn-lg",
      disabled: this.props.error
    }, 'Start training')));
  }
});

Game = React.createClass({
  startCountdown: function() {
    return store.dispatch({
      type: 'startCountdown'
    });
  },
  startAnother: function() {
    return store.dispatch({
      type: 'startAnother'
    });
  },
  render: function() {
    return div({}, this.props.finished ? this.renderFinished() : void 0, this.props.tasks.length ? this.renderProgress() : void 0, this.renderTasks(), !(this.props.running || this.props.countdown || this.props.tasks.length) ? button({
      type: "submit",
      className: "btn btn-primary btn-lg center-block",
      onClick: this.startCountdown
    }, 'Click here when ready') : void 0);
  },
  countDownText: function() {
    var cntdown;
    if (this.props.countdown || 0 === this.props.countdown && !this.props.tasks.length) {
      cntdown = 1 + this.props.countdown;
      speak(3 === cntdown ? "Ready in " + cntdown : "" + cntdown);
      return "Ready in " + cntdown + "...";
    } else {
      return speak('Get ready...');
    }
  },
  taskDesc: function(task) {
    return task.desc + " (" + task.elapsed + "s)";
  },
  renderTasks: function() {
    var ref, task, tasks;
    ref = this.props.tasks, task = ref[0], tasks = 2 <= ref.length ? slice.call(ref, 1) : [];
    if (task) {
      return div({
        className: 'panel panel-primary'
      }, this.renderHeading('Remaining time: ' + task.time), div({
        className: 'panel-body'
      }, p({
        className: 'lead'
      }, strong({}, this.taskDesc(task)))), ul({
        className: 'list-group'
      }, _.map(tasks, (function(_this) {
        return function(task) {
          return li({
            className: 'list-group-item text-muted'
          }, _this.taskDesc(task));
        };
      })(this))));
    } else {
      return div({
        className: 'panel panel-primary'
      }, this.renderHeading(this.countDownText()));
    }
  },
  renderHeading: function(heading) {
    var rightEl;
    rightEl = $('body').width() < 400 ? small : span;
    return div({
      className: 'panel-heading'
    }, h3({
      className: 'panel-title'
    }, heading, rightEl({
      className: 'pull-right'
    }, "Target: " + this.props.target + ", Elapsed: " + this.props.elapsed)));
  },
  renderFinished: function() {
    return div({
      className: 'jumbotron'
    }, p({}, speak("Congratulations! You completed " + (formatTime(this.props.elapsed)) + " of training!")), button({
      className: "btn btn-success btn-lg ",
      style: {
        marginBottom: 20
      },
      onClick: this.startAnother
    }, 'Start another training'));
  },
  renderProgress: function() {
    var tasks;
    tasks = this.props.tasks.map((function(_this) {
      return function(task) {
        var percent, type;
        percent = task.elapsed / _this.props.target * 100;
        type = ['success', 'info', 'warning', 'danger'][task.diff];
        return div({
          className: "progress-bar progress-bar-" + type + " progress-bar-striped active",
          role: "progressbar",
          style: {
            width: percent + "%"
          }
        });
      };
    })(this));
    tasks.reverse();
    return div({
      className: 'progress'
    }, tasks);
  }
});

pluralize = function(num, singular, plural) {
  if (plural == null) {
    plural = singular + 's';
  }
  switch (num) {
    case 0:
      return "";
    case 1:
      return "1 " + singular;
    default:
      return num + " " + plural;
  }
};

formatTime = function(seconds) {
  var m$, minutes, s$;
  minutes = Math.floor(seconds / 60);
  m$ = pluralize(minutes, "minute");
  seconds = seconds % 60;
  s$ = pluralize(seconds, "second");
  return (m$ + " " + s$).trim();
};

assertEqual = function(expected, actual) {
  if (expected !== actual) {
    throw new Error("Expected: <" + expected + "> but got: <" + actual + ">");
  }
};

testFormatTime = function() {
  assertEqual("", formatTime(0));
  assertEqual("1 second", formatTime(1));
  assertEqual("2 seconds", formatTime(2));
  assertEqual("59 seconds", formatTime(59));
  assertEqual("1 minute", formatTime(60));
  assertEqual("1 minute 1 second", formatTime(61));
  assertEqual("1 minute 2 seconds", formatTime(62));
  assertEqual("1 minute 59 seconds", formatTime(119));
  assertEqual("2 minutes", formatTime(120));
  assertEqual("2 minutes 1 second", formatTime(121));
  assertEqual("2 minutes 2 seconds", formatTime(122));
  assertEqual("2 minutes 59 seconds", formatTime(179));
  assertEqual("10 minutes", formatTime(600));
  assertEqual("10 minutes 1 second", formatTime(601));
  assertEqual("10 minutes 2 seconds", formatTime(602));
  assertEqual("10 minutes 59 seconds", formatTime(659));
  return console.log('All systems functional.');
};

Tasks = [
  {
    desc: 'lick it all over. Get that cock nice and wet. ',
    min: 15,
    max: 30,
    diff: 0
  }, {
    desc: 'lets see you slurp on it like a lollipop. Arent you lucky?', 
    min: 10,
    max: 15,
    diff: 0
  }, {
    desc: 'moan like a whore while you suck the tip',
    min: 10,
    max: 15,
    diff: 0
  }, {
    desc: 'hold it just in front of your throat on the edge of gagging. Do not gag. Show some control.',
    min: 15,
    max: 30,
    diff: 0
  }, {
    desc: 'Bob your head on the top half of that cock. Dont use your throat this time, just enjoy the feeling of your mouth being filled by that cock.', 
    min: 15, 
    max: 25, 
    diff: 0
  }, {
    desc: 'suck it Toy! Come on, I dont have all day. ',
    min: 20,
    max: 30,
    diff: 1
  },{
    desc: 'suck it sensuously with your mouth, make that cock feel good. ',
    min: 10,
    max: 30,
    diff: 1
  }, {
    desc: 'wipe the spit on your face. I have never seen such a pathetic effort. We will need to do something about that soon',
    min: 10,
    max: 15,
    diff: 1
  }, {
    desc: 'suck that cock. Show what a good blowjob you can give. ',
    min: 10,
    max: 30,
    diff: 1
  },{
    desc: 'deepthroat hard and fast. All the way in and all the way out',
    min: 20,
    max: 30,
    diff: 3
  }, {
    desc: 'deepthroat slowly from tip to base. In and out, in and out. Show what a good little cock sucker you are.',
    min: 20,
    max: 30,
    diff: 2
  }, {
    desc: 'Fuck your mouth fast',
    min: 20,
    max: 30,
    diff: 2
  },{
    desc: 'hold it in your throat. Thats it,',
    min: 5,
    max: 20,
    diff: 2
  }, {
    desc: 'beg to have this cock in your throat. Convince me that you want to be thoroughly throatfucked... Come on, louder. I cant hear you toy.',
    min: 20,
    max: 30,
    diff: 1
  }, {
    desc: 'go deep, hold for 3, up for 3. Repeat until I get bored',
    min: 20,
    max: 40,
    diff: 3
  }, {
    desc: 'Hold that cock in your mouth. time to remind you what you are. Crush your balls in both hands. I will know if you dont do it hard enough' ,
    min: 20,
    max: 30,
    diff: 2
  },{
    desc: 'fuck your throat as fast as you can,', 
    min: 10,
    max: 30,
    diff: 3
  },{
    desc: 'all the way in, all the way out. Faster. Come on Toy, you know how this works by now' ,
    min: 20,
    max: 30,
    diff: 3
  }, {
    desc: 'you can do better than that. keep it in your throat until I say otherwise. I do not care how much you gag, Spank your balls as hard as you can if you fail', 
    min: 25,
    max: 40,
    diff: 3
  },{
    desc: 'Work your throat like a piston. I cant believe you signed up for this. ',
    min: 20,
    max: 30,
    diff: 3
  },{
    desc: 'Spank your balls. Make sure you dont let that cock out of your mouth. Harder. I said harder. Speed up as well.', 

min: 20,
    max: 30,
    diff: 2
  }
];

generateTask = function(lastTask, target, elapsed) {
  var i, max, prefDiff, task, time;
  prefDiff = Math.floor(5 * elapsed / target);
  i = 0;
  while (true) {
    task = _.sample(Tasks);
    if (Math.abs(task.diff - prefDiff) > i++) {
      continue;
    }
    if (task.desc !== (lastTask != null ? lastTask.desc : void 0)) {
      break;
    }
  }
  max = local ? task.min : task.max;
  time = _.min([_.random(task.min, max), target - elapsed]);
  return dup(task, {
    time: time,
    elapsed: time
  });
};

customizeInitialState = {
  customize: false
};

customize = function(state, action) {
  if (state == null) {
    state = customizeInitialState;
  }
  console.log('customize', state, action);
  switch (action.type) {
    case 'customize':
      return dup(state, {
        customize: true
      });
    default:
      return state;
  }
};

ref = React.DOM, a = ref.a, br = ref.br, button = ref.button, div = ref.div, form = ref.form, img = ref.img, h1 = ref.h1, h2 = ref.h2, h3 = ref.h3, h4 = ref.h4, input = ref.input, label = ref.label, li = ref.li, option = ref.option, p = ref.p, select = ref.select, small = ref.small, span = ref.span, strong = ref.strong, ul = ref.ul;

el = React.createElement;

make = function(prop, val) {
  var obj;
  obj = {};
  obj[prop] = val;
  return obj;
};

dup = function() {
  var objs, state;
  state = arguments[0], objs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  return _.assign.apply(_, [{}, state].concat(slice.call(objs)));
};

trainerLogic = Redux.combineReducers({
  gameParams: gameParams,
  game: game,
  customize: customize
});

store = Redux.createStore(trainerLogic);

DTTMain = React.createClass({
  render: function() {
    return div({
      className: "container"
    }, h1({}, 'Deepthroat Trainer'), this.props.game.started ? el(Game, this.props.game) : el(StartSelector, this.props.gameParams));
  }
});

render = function() {
  return ReactDOM.render(el(DTTMain, store.getState()), document.getElementById('content'));
};

store.subscribe(render);

render();

if (local) {
  store.subscribe(function() {
    return console.log('current state', JSON.stringify(store.getState()));
  });
  testFormatTime();
}

speak = function(task) {
  if (store.getState().gameParams.speechEnabled) {
    responsiveVoice.speak(task, "UK English Female", {
      rate: 0.8
    });
  }
  return task;
};
