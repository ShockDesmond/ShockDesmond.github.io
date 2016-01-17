// Generated by CoffeeScript 1.10.0
var Game, Panel, TH1Main, TimerButton, a, button, d16, div, el, form, fullRow, h1, h3, h4, img, input, label, li, option, p, ref, row, select, span, strong, ul;

ref = React.DOM, a = ref.a, button = ref.button, div = ref.div, form = ref.form, img = ref.img, h1 = ref.h1, h3 = ref.h3, h4 = ref.h4, input = ref.input, label = ref.label, li = ref.li, option = ref.option, p = ref.p, select = ref.select, span = ref.span, strong = ref.strong, ul = ref.ul;

el = React.createElement;

row = function(optsOrContent, maybeContent) {
  var content, opts;
  if (maybeContent) {
    content = maybeContent;
    opts = optsOrContent;
  } else {
    content = optsOrContent;
    opts = {};
  }
  return div({
    key: opts.key,
    className: 'row',
    style: {
      marginTop: 20,
      marginBottom: opts.marginBottom
    }
  }, content);
};

fullRow = function(optsOrContent, maybeContent) {
  var content, opts;
  if (maybeContent) {
    content = maybeContent;
    opts = optsOrContent;
  } else {
    content = optsOrContent;
    opts = {};
  }
  return row(opts, div({
    className: "col-xs-12 " + opts.additionalClass
  }, content));
};

d16 = function() {
  return parseInt(1 + Math.random() * 6);
};

Panel = React.createClass({displayName: "Panel",
  getDefaultProps: function() {
    return {
      panelClass: 'panel-default'
    };
  },
  render: function() {
    var panelClass;
    panelClass = 'panel ' + (_.isUndefined(this.props.primaryPanel) ? this.props.panelClass : this.props.primaryPanel ? 'panel-primary' : 'panel-default');
    return div({
      className: panelClass
    }, this.props.heading ? div({
      className: 'panel-heading'
    }, h3({
      className: 'panel-title'
    }, this.props.heading)) : void 0, div({
      className: 'panel-body'
    }, this.props.body));
  }
});

TimerButton = React.createClass({displayName: "TimerButton",
  getInitialState: function() {
    return {
      countdown: void 0,
      timer: void 0,
      done: false
    };
  },
  startTimer: function() {
    this.setState({
      countdown: 3
    });
    return this.interval = setInterval(this.timerCallback, 1000);
  },
  timerCallback: function() {
    if (this.state.countdown > 0) {
      return this.setState({
        countdown: this.state.countdown - 1,
        timer: this.props.seconds
      });
    } else if (this.state.timer > 0) {
      return this.setState({
        timer: this.state.timer - 1,
        done: 1 === this.state.timer
      });
    } else if (this.state.timer === 0) {
      clearInterval(this.interval);
      return this.interval = 0;
    }
  },
  componentWillUnmount: function() {
    if (this.interval) {
      return clearInterval(this.interval);
    }
  },
  render: function() {
    if (this.state.countdown) {
      return p({
        className: 'lead'
      }, "Ready in " + this.state.countdown + "...");
    } else if (this.state.timer) {
      return p({
        className: 'lead'
      }, "Hold it! " + this.state.timer + "...");
    } else if (this.state.done) {
      return p({
        className: 'lead'
      }, "Done. If you couldn't make it, try again and hold it as long as you can this time.");
    } else {
      return button({
        className: "btn btn-warning btn-lg",
        onClick: this.startTimer,
        style: {
          marginRight: 20
        }
      }, 'Start timer');
    }
  }
});

Game = React.createClass({displayName: "Game",
  getInitialState: function() {
    return {
      position: this.randomPosition(),
      nextTask: 0,
      tasks: []
    };
  },
  randomPosition: function() {
    return _.sample(['On the floor, kneeling', 'On the floor, ass on the ground between your legs', 'Neck on border of your bed', 'Sitting in the bathtub', 'Standing']);
  },
  tasks: [['Lick on it', 'Gag on it 5 times', 'Gag on it 10 times', 'Swallow it down your throat 5 times', 'Swallow it down your throat 10 times', 'Gag on it 15 times, then swallow it down your throat 15 times'], ['Very slowly, go deeper and deeper', 'Push it down your throat and leave it there for 3 seconds.', 'Push it down your throat and leave it there for 6 seconds.', 'Push it in as fast as you can and leave it there for 10 seconds', 'Push it in as fast as you can and leave it there for 15 seconds', 'Push it into your throat and out as fast you can 3 times, repeat it 5 times'], [], ['Play with your spit with both hands', 'I want to see your face full of spit', 'Get all that spit back into your dirty mouth, after that back into the bowl, slowly', 'Gather all the spit in your hands, then suck it back into your mouth', 'Get all that spit back into your dirty mouth and swallow it', 'Take all that spit and grease it on your belly, tits and face']],
  randomTask: function(num) {
    return _.sample(this.tasks[num]);
  },
  timerTask: function() {
    var d3, secs;
    d3 = d16();
    secs = 0;
    while (d3--) {
      secs += d16();
    }
    return secs;
  },
  speak: function(task) {
    if (this.props.speechEnabled) {
      return responsiveVoice.speak(task, "UK English Female", {
        rate: 0.8
      });
    }
  },
  getNextTask: function() {
    var m, secs, task, timerTask;
    timerTask = 2 === this.state.nextTask;
    task = timerTask ? "Hold your dildo in your throat for " + (this.timerTask()) + " seconds." : this.randomTask(this.state.nextTask);
    if (m = task.match(/(\d+) seconds/)) {
      secs = +m[1];
    }
    this.speak(task);
    return this.setState({
      nextTask: 1 + this.state.nextTask,
      tasks: [task].concat(this.state.tasks),
      timerSecs: secs
    });
  },
  render: function() {
    return div({}, this.renderButton(), this.renderTasks(), this.renderPosition());
  },
  renderPosition: function() {
    return el(Panel, {
      primaryPanel: 0 === this.state.nextTask,
      heading: 'Position',
      body: this.state.position
    });
  },
  renderTasks: function() {
    return _.map(this.state.tasks, (function(_this) {
      return function(task, i) {
        var n;
        n = _this.state.nextTask - i;
        return el(Panel, {
          key: "task" + n,
          primaryPanel: 0 === i,
          heading: 'Task ' + n,
          body: task
        });
      };
    })(this));
  },
  renderButton: function() {
    return fullRow({
      marginBottom: 20
    }, this.state.nextTask < this.tasks.length ? div({
      className: 'text-center center-block'
    }, this.state.timerSecs ? el(TimerButton, {
      key: 'timer' + this.state.nextTask,
      seconds: this.state.timerSecs,
      speak: this.speak
    }) : void 0, button({
      className: "btn btn-primary btn-lg ",
      onClick: this.getNextTask
    }, 'Get next task')) : button({
      className: "btn btn-success btn-lg center-block",
      onClick: this.props.startAnother
    }, 'Start another game'));
  }
});

TH1Main = React.createClass({displayName: "TH1Main",
  getInitialState: function() {
    return {
      started: false,
      speechEnabled: this.isSpeechEnabled()
    };
  },
  isSpeechEnabled: function() {
    var ref1;
    return ((ref1 = window.localStorage) != null ? ref1.speechEnabled : void 0) === 'true';
  },
  startAnother: function() {
    return this.setState({
      started: false
    });
  },
  startGame: function() {
    return this.setState({
      started: true
    });
  },
  toggleSpeech: function() {
    var ref1, speechEnabled;
    speechEnabled = !this.state.speechEnabled;
    if ((ref1 = window.localStorage) != null) {
      ref1.speechEnabled = speechEnabled;
    }
    return this.setState({
      speechEnabled: speechEnabled
    });
  },
  render: function() {
    return div({
      className: "container"
    }, h1({}, 'Throat Heaven 1'), this.renderIntroduction(), this.state.started ? el(Game, {
      startAnother: this.startAnother,
      speechEnabled: this.state.speechEnabled
    }) : this.renderStartGameButton(), this.renderFooter());
  },
  renderFooter: function() {
    return div({
      className: 'row',
      style: {
        marginTop: 20
      }
    }, div({
      className: "col-xs-5"
    }, label({}, input({
      type: 'checkbox',
      checked: this.state.speechEnabled,
      onChange: this.toggleSpeech
    }), ' Enable speech')), div({
      className: "col-xs-7"
    }, p({
      className: 'pull-right lead'
    }, 'Based on ', a({
      href: 'http://www.getdare.com/bbs/showthread.php?t=176573',
      target: '_blank'
    }, 'Throat Heaven 1 dare'))));
  },
  renderStartGameButton: function() {
    return fullRow(button({
      className: "btn btn-primary btn-lg center-block",
      onClick: this.startGame
    }, 'Start a new dare'));
  },
  renderIntroduction: function() {
    return el(Panel, {
      primaryPanel: !this.state.started,
      heading: 'Introduction',
      body: div({}, p({}, "Get naked. Grab your doubledildo or something that you can swallow."), p({}, "Place a bowl under your face. You will create lots of spit, don't swallow it, the bowl has to be full of your spit."), p({}, "Roll to determine how you must suck the dildo. "))
    });
  }
});

ReactDOM.render(el(TH1Main, null), document.getElementById('content'));
