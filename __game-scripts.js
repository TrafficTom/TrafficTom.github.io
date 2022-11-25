// traffic-rider.js
// Traffic rider namespace
var tr = {};

Object.defineProperty(tr, 'SoundController', {
    get: function() {
        if (this._soundController)
            return this._soundController;
        
        this._soundController = pc.app.root.findByName('SFX').sound;
        
        return this._soundController;
    }
});

Object.defineProperty(tr, 'MusicController', {
    get: function() {
        if (this._musicController)
            return this._musicController;
        
        this._musicController = pc.app.root.findByName('Music').sound;
        
        return this._musicController;
    }
});

// famobi.js
/* jshint esversion: 6 */

/* global game state & management variables */
var game = pc.Application.getApplication();
var isPageVisible = true;
var adIsShowing = false;

/* Application extensions */

pc.Application.prototype.pauseGame = function() {
    this.applicationPaused = true;
    this.soundVolumeBeforePaused = SoundController.masterVolume;
    this.fire(tr.Events.SOUND_SET_MASTER_VOLUME, 0);
    this.timeScaleBeforePaused = this.timeScale;
    this.timeScale = 0;
};

pc.Application.prototype.unpauseGame = function(forced) {    
    if(this.applicationFinished) return; //no need to unpause
    
    if (isPageVisible && (!adIsShowing || forced)) {
        this.applicationPaused = false;
        this.fire(tr.Events.SOUND_SET_MASTER_VOLUME, this.soundVolumeBeforePaused || 1);
        this.timeScale = this.timeScaleBeforePaused;    
    } else {
        famobi.log('resuming game is not allowed now because ads are displaying or page is not visible...');
    }
};



/* global famobi entry point */
var famobi = window.famobi;


/* famobi API mock */
(function() {
    if(typeof famobi !== "undefined" || window.famobi)  {
        console.warn("Famobi API is already defined");
        return; /* famobi API is already defined */
    }
    
    window.famobi = window.famobi || {};
    window.famobi.localStorage = window.famobi.localStorage || window.localStorage;
    window.famobi.sessionStorage = window.famobi.sessionStorage || window.sessionStorage;

    window.famobi.log = window.famobi.log || console.log;
    window.famobi.openBrandingLink = window.famobi.openBrandingLink || function () {};
    window.famobi.showInterstitialAd = window.famobi.showInterstitialAd || function () { return Promise.resolve(); };
    window.famobi.hasRewardedAd = window.famobi.hasRewardedAd ||  function () { return true; }; 
    window.famobi.rewardedAd = window.famobi.rewardedAd || function (callback) { setTimeout(() => { console.log("Watching a rewarded video..."); callback({rewardGranted: true}); }, 500);};
    
    const log = (message, color = '#bada55', backgroundColor = '#222') => console.log('%c ' + message, `background: ${backgroundColor}; color: ${color}`);
    
    window.famobi.getBrandingButtonImage = () => "https://games.cdn.famobi.com/html5games/branding/spielaffe/More_Games600x253_onWhite.png";
    window.famobi.setPreloadProgress = value => log(`Progress ${value}%`, '#880000', '#FFEEEE');
    window.famobi.gameReady = value => log("gameReady() reported", "#FFFFFF", "#880000");
    window.famobi.playerReady = () => log('playerReady() reported', '#00FF66', '#000');
    window.famobi.getVolume = () => 1;
    
    window.famobi_analytics = window.famobi_analytics || {
        trackEvent: (key, obj) => {
            if(key !== "EVENT_LIVESCORE") log("trackEvent(" + key + ', ' + JSON.stringify(obj) + ")");
            return new Promise((resolve, reject) => resolve());
        },

        trackScreen: (key) => {
            log("trackScreen(" + key + ")");
        },
        
        trackStats: (key, options, amount) => {
            log("[trackStats] " + key + " x" + (amount || 1) + " " + JSON.stringify(options || ""), "#FFFFFF", "#FF00FF");
        },
    };
    
     window.famobi_tracking = window.famobi_tracking || {
        EVENTS: {
            LEVEL_START: "LEVEL_START",
            LEVEL_UPDATE: "LEVEL_UPDATE",
            LEVEL_END: "LEVEL_END"
        },
         
        init: (...args) => {
            log("Famobi tracking API initialzied ", ...args);  
        },
         
        trackEvent: (key, obj) => {
            log("famobi_tracking.trackEvent(" + key + ', ' + JSON.stringify(obj) + ")", "#000033", "#EECCFF");
            return new Promise((resolve, reject) => resolve());
        }
    };
    
    window.famobi.onRequest = (param, callback) => {
        famobi.requests = famobi.requests || {};
        famobi.requests[param] = callback;

        if(param === 'startGame') {
            console.warn('Starting game in 5500 ms...');
            setTimeout(() => callback(), 5500);
        }
    };
    
    
    window.famobi.hasFeature = function(key) {
        const options = {
            external_start: false,
            skip_title: false,
            skip_tutorial: false,
            auto_quality: false,
            forced_mode: false,
            external_mute: false,
            external_pause: false,
            external_leaderboard: false,
            copyright: true
        };
        return options[key] || false;
    };
    
    
    famobi.getFeatureProperties = function(key) {
        if(key === 'forced_mode') {
            return {
                    "state": {
                        "level": 1,
                    },
                    "override": {
                        "hide_ui": ["mission_progress"],
                    }
                };
        } else {
            return {};
        }
    };        
    
})();


/* famobi feaures shortcuts */


var getForcedModeProperties = function() {
    const forcedModePproperties =  typeof famobi !== "undefined" && famobi.getFeatureProperties("forced_mode");
    return forcedModePproperties;
};

var isExternalStart = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("external_start");
};

var isExternalMute = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("external_mute");
};

var isExternalPause = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("external_pause");
};

var skipTitleScreen = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("skip_title");
};

var skipTutorial = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("skip_tutorial");
};

var useAutoQuality = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("auto_quality");
};

var isForcedMode = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("forced_mode");
};

var isCopyrightEnabled = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("copyright");
};

var isEndlessMode = function() {
    return isForcedMode() && getForcedModeProperties().state.level === -1;
};

var hasExternalLeaderboard = function() {
    return typeof famobi !== "undefined" && famobi.hasFeature("external_leaderboard");
};

var isUIHidden = function(uiKey) {
    return isForcedMode() && getForcedModeProperties() && getForcedModeProperties().override.hide_ui && getForcedModeProperties().override.hide_ui.indexOf(uiKey) !== -1;
};



/* famobi pause/resume requests */

window.famobi_onPauseRequested = function () {
    adIsShowing = true;
    if (game) {
        game.pauseGame();
    }
};

window.famobi_onResumeRequested = function () {
    adIsShowing = false;
    if (game) {
        game.unpauseGame();
    }
};


/* Monkey App handlers */

//Monkey App handlers
if(window.famobi) {
    window.famobi.onRequest("pauseGameplay", function() {
        if (game) {
            game.pauseGame();
        }
    });
    
    window.famobi.onRequest("resumeGameplay", function() {
        if (game) {
            game.unpauseGame();
        }
    });
    
    window.famobi.onRequest("enableAudio", function() {
        if(game) {
            game.fire(tr.Events.API_ENABLE_AUDIO);
        }
    });
    
    window.famobi.onRequest("disableAudio", function() {
        if(game) {
            game.fire(tr.Events.API_DISABLE_AUDIO);
        }
    });
    
    window.famobi.onRequest("enableMusic", function() {
        if(game) {
            game.fire(tr.Events.API_ENABLE_MUSIC);
        }
    });

    window.famobi.onRequest("disableMusic", function() {
        if(game) {
            game.fire(tr.Events.API_DISABLE_MUSIC);
        }
    });
    
    window.famobi.onRequest("changeVolume", function(volume) {
        if(game) {
            game.fire(tr.Events.SOUND_SET_VOLUME_MULTIPLIER, volume);
        }
    });
}


/* Window Visibility API */
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
} else if (typeof document["msHidden"] !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
} else if (typeof document["webkitHidden"] !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
}

function handleVisibilityChange() {
    if (document[hidden]) {
        isPageVisible = false;
        // if (game && !adIsShowing) game.pauseGame();
    } else {
        isPageVisible = true;
        if (game && !adIsShowing && game.applicationPaused && !game.applicationFinished) game.unpauseGame();
    }
}

// Warn if the browser doesn't support addEventListener or the Page Visibility API
if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
    console.log("Browser doesn't support the Page Visibility API.");
} else {
    // Handle page visibility change
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
}

console.log("Window VisibilityAPI connected");


// utils.js
pc.extend(tr, function () {

    var Utils = {};
    
    Utils.RAD_TO_DEG = 57.2958;
    Utils.DEG_TO_RAD = 0.0174533;
    
    Utils.kmhToMs = function(kmh) {
        return kmh / 3.6;
    };

    Utils.msToKmh = function(ms) {
        return ms * 3.6;
    };

    Utils.getOrthogonalVectors = function(n, p, q) {
        // From the Bullet sourcebase. See btPlaneSpace1.
        // Generate two suitable orthogonal vectors to n.
        var a, k;
        if (Math.abs(n.z) > 0.7071067811865475244008443621048490) {
            // choose p in y-z plane
            a = n.y * n.y + n.z * n.z;
            k = 1 / Math.sqrt(a);
            p.x = 0;
            p.y = -n.z * k;
            p.z = n.y * k;
            // set q = n x p
            q.x = a * k;
            q.y = -n.x * p.z;
            q.z = n.x * p.y;
        } else {
            // choose p in x-y plane
            a = n.x * n.x + n.y * n.y;
            k = 1 / Math.sqrt(a);
            p.x = -n.y * k;
            p.y = n.x * k;
            p.z = 0;
            // set q = n x p
            q.x = -n.z * p.y;
            q.y = n.z * p.x;
            q.z = a * k;
        }
    };

    Utils.bound = function(num, bound) {
        return num > 0 ? Math.min(num, bound) : Math.max(num, -bound);
    };
    
    Utils.bound2 = function(num, min, max) {
        return num >= max ? max : Math.max(num, min);
    };

    Utils.isLandscape = function () {
        return pc.app.graphicsDevice.width > pc.app.graphicsDevice.height;
    };
    
    Utils.findUIScreen = function (entity) {
        var parent = entity.parent;
        
        while (!parent.screen) {
            parent = parent.parent;
        }
        
        return parent.screen;
    };

    Utils.getRandomIndex = function(array) {
        return array.length ? Math.round(Math.random() * (array.length - 1)) : -1;
    };
    
    Utils.getRandomValue = function(array) {
        return array.length ? array[Math.round(Math.random() * (array.length - 1))] : -1;
    };
    
    Utils.getRandomInt = function(a, b) {
        return Math.round(Math.random() * (b - a) + a);
    };

    Utils.getRandomNumber = function(a, b) {
        return Math.random() * (b - a) + a;
    };
    
    Utils.precisionRound = function(val, charNum) {
        var multiplier = Math.pow(10, charNum);
        
        return Math.round(val * multiplier) / multiplier;
    };
    
    Utils.isInRange = function(a, b, val) {
        return val >= a && val <= b;
    };
    
    Utils.isOutOfRange = function(a, b, val) {
        return val < a || val > b;
    };    
    
    Utils.getValues = function (obj) {
        var keys = Object.keys(obj),
            values = [];

        keys.forEach(function (key, index) {
            values.push(obj[key]);
        });

        return values;
    };

    Utils.getStorageItem = function (key, type) {
        var item = window.famobi.localStorage.getItem(key),
            parsedType,
            parsed;

        try {
            parsed = JSON.parse(item);
        } catch(e) {
            parsed = item;
        }
        
        if (!type)
            return parsed;
        
        parsedType = typeof parsed;
        
        if (parsedType == type)
            return parsed;
        else
            return null;
    };

    Utils.setStorageItem = function (key, value) {
        window.famobi.localStorage.setItem(key, JSON.stringify(value));
    };

    Utils.throwDice = function (probability) {
        var rand = Math.random();

        return rand <= probability;
    };

    Utils.wait = function (timeout) {
        return new Promise(function(res, rej) {
            setTimeout(function () {
                res();
            }, timeout);
        });
    };
    
    Utils.formatTime = function (time) {
        var sec = Math.ceil(time % 60);
        
        return Math.floor(time / 60) + ':' + (sec < 10 ? '0' : '') + sec;
    };
    
    Utils.range = function (len) {
        var x = [],
            i = 1;
        
        while(x.push(i++) < len) {}
        
        return x;
    };
    
    Utils.getAABB = function (modelEntity) {
        var aabb;
        
        modelEntity.model.meshInstances.forEach(function(meshInstance, index) {
            if (!aabb) {
                aabb = meshInstance.aabb.clone();
                return;
            }

            aabb.add(meshInstance.aabb);
        });
        
        return aabb;
    };
    
    Utils.normalize = function (min, max, val) {
        return (val - min) / (max - min);
    };
    
    Utils.precision = function (num) {
        if (!isFinite(num)) return 0;
        
        var e = 1, 
            p = 0;
        
        while (Math.round(num * e) / e !== num) { e *= 10; p++; }
        
        return p;
    };
    
    return { 
        Utils: Utils
    };
    
}());

// Config.js
pc.extend(tr, function () {
    
    var Config = {};

    Config.INIT_PARAMS = { AUTO_THROTTLE: true,
                           CRASH: true,
                           TWO_WAY: true };
    
    Config.PARAMETERS = pc.extend({}, Config.INIT_PARAMS);
    
    Config.ROAD_BORDER = 7;
    Config.COMBO_INT = 3.5;
    Config.MAX_COMBO_REWARD = 0.4;
    Config.POINTS_PER_M = 0.25;
    Config.MIN_REWARD_SPEED = tr.Utils.kmhToMs(40);
    Config.OVERTAKE_REWARD = 0.2;
    Config.OVERTAKE_REWARD_STEP = 0.05;
    Config.OVERTAKE_INT = 0.3;
    Config.OVERTAKE_INT_TUTORIAL = 0.35;
    Config.MIN_SPEED = tr.Utils.kmhToMs(20);
    Config.CRASH_VELOCITY = tr.Utils.kmhToMs(70);
    Config.HIGH_SPEED = tr.Utils.kmhToMs(70);
    Config.OVERTAKE_SPEED = tr.Utils.kmhToMs(70);
    Config.LANES_Z = [5.26, 1.75, -1.75, -5.26];
    Config.MIN_CAR_DIST = 30;
    
    Config.PITCH_BANDS = [ [new pc.Vec2(1, 2) ],
                         
                           [new pc.Vec2(0.5, 1.5),
                            new pc.Vec2(1.1, 1.5)] ];
    
    Config.MODE_TIME_REMAINING = 100;
    
    return {
        Config: Config
    };
    
}());

// keys.js
pc.extend(tr, function () {

    var Keys = {};
    
    Keys.STORAGE_KEYS = { CASH: 'Cash',
                          SELECTED_BIKE: 'SelectedBike',
                          BLEVELS: 'BLevels',
                          CMISSION: 'CMission',
                          UBIKES: 'Ubikes',
                          OBIKES: 'Obikes',
                          SOUND: 'Sound' };
    
    Keys.SCREENS = { GARAGE: 'Garage',
                     GAME: 'Game',
                     SPLITSCREEN: 'Splitscreen',
                     SHOWUP: 'Showup',
                     GAS_STATION: 'GasStation',
                     GO: 'Go' };
    
    Keys.BIOMES = { BIOME_A: 'biome_a',
                    BIOME_B: 'biome_b',
                    CROSSROAD: 'crossroad' };
    
    Keys.GAME_AREAS = { HIGHWAY: 'highway',
                        ROADSIDE: 'roadside',
                        ROUTE66: 'route66' };
    
    Keys.GAME_MODES = { CAREER: 'career',
                        ENDLESS: 'endless',
                        TIME_TRIAL: 'timeTrial',
                        CHECKPOINT_RUN: 'checkpointRun',
                        OVERTAKE: 'overtake',
                        RACE: 'race',
                        COMBO: 'combo' };
    
    Keys.GAME_STATES = { FAILED:    0,
                         PASSED:    1,
                         PAUSED:    2,
                         COUNTDOWN: 3,
                         CRASHED:   4,
                         ACTIVE:    5 };
    
    Keys.SOUNDS = { GARAGE_INTRO: 'Garage intro',
                    GARAGE_LOOP: 'Garage loop',
                    OPEN_GARAGE: 'Open garage',
                    BUTTON_CLICK: 'Button click',
                    CLOCK_TICKING: 'Clock ticking',
                    CAR_CRASH: 'Car crash',
                    FENCE_CRASH: 'Fence crash',
                    CAR_OVERTAKE: 'Car overtake',
                    COUNTDOWN: 'Countdown',
                    LEVEL_WIN: 'Level win', 
                    LEVEL_FAIL: 'Level fail',
                    BIKE_UPGRADE: 'Bike upgrade',
                    BIKE_UNLOCK: 'Bike unlock',
                    BOSS_SPLITSCREEN: 'Boss splitscreen',
                    EARN_MONEY: 'Earn money',
                    EXPLOSION: 'Explosion',
                    WRENCH_COLLECT: 'Wrench collect',
                    GAME_MUSIC: 'Game music',
                    INTRO: 'Intro' };
    
    Keys.BOSSES = { BOSS_1: 'BigMike',
                    BOSS_2: 'Weasel',
                    BOSS_3: 'TheFalcon',
                    SIDEBOSS: 'Goon' };
    
    return {
        Keys: Keys
    };
    
}());

// storage.js
pc.extend(tr, function () {

    var Storage = {};
    
    Storage.gameState = tr.Keys.GAME_STATES.FAILED;
    Storage.totalCash = tr.Utils.getStorageItem(tr.Keys.STORAGE_KEYS.CASH) || 0;
    Storage.currentMission = tr.Utils.getStorageItem(tr.Keys.STORAGE_KEYS.CMISSION) || 1;
    Storage.gameMode = 'endless';
    Storage.gameArea = 'highway';
    Storage.checkpoints = [];
    Storage.selectedBike = tr.Utils.getStorageItem(tr.Keys.STORAGE_KEYS.SELECTED_BIKE) || 1;
    Storage.bikeLevels = tr.Utils.getStorageItem(tr.Keys.STORAGE_KEYS.BLEVELS) || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    Storage.unlockedBikes = tr.Utils.getStorageItem(tr.Keys.STORAGE_KEYS.UBIKES) || [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    Storage.ownBikes = tr.Utils.getStorageItem(tr.Keys.STORAGE_KEYS.OBIKES) || [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    Storage.sound = tr.Utils.getStorageItem(tr.Keys.STORAGE_KEYS.SOUND, 'object') || {music: true, sfx: true};
    
    Storage.getFlareModel = function() {
        var self = this;
         
        if (this._flareModel)
            return Promise.resolve(this._flareModel);
        
        if (this._flarePromise)
            return this._flarePromise;
        
        this._flarePromise = new Promise(function (res, rej) {
            self._flareResolve = res;
        });
        
        return this._flarePromise;
    };
    
    Storage.getVisibleScores = function() {
        return Math.floor(this.scores);
    };
    
    Storage.getVisibleDistance = function() {
        return Number(this.distance / 1000).toFixed(2);
    };
    
    Storage.getVisibleDistanceRem = function() {
        return Number(Math.abs(this.distanceRem / 1000)).toFixed(2);
    };
    
    Storage.getVisibleTime = function() {
        return Number(Math.abs(this.timeRemaining)).toFixed(1);
    };
    
    Storage.getMaxSpeed = function() {
        return this.selectedBikeSpecs.maxSpeed[this.getBikeLevel()];
    };
    
    Storage.getMaxSpeedByIndex = function(bikeIndex) {
        return this.getBikeSpecsByIndex(bikeIndex).maxSpeed[this.getBikeLevelByIndex(bikeIndex)];
    };
    
    Storage.getMaxSpeedUpgradedByIndex = function(bikeIndex, level) {
        return this.getBikeSpecsByIndex(bikeIndex).maxSpeed[level];
    };
    
    Storage.getMaxSpeedUpgraded = function(level) {
        return this.selectedBikeSpecs.maxSpeed[level];
    };
    
    Storage.getPower = function() {
        return this.selectedBikeSpecs.acceleration + (0.4 * this.getBikeLevel());
    };
    
    Storage.getBreaking = function() {
        return this.selectedBikeSpecs.breaking;
    };
    
    Storage.getBotPower = function() {
        return this.botBikeSpecs.acceleration;
    };
    
    Storage.getBotBreaking = function() {
        return this.botBikeSpecs.breaking;
    };
    
    Storage.getUpgradeCost = function() {
        return this.selectedBikeSpecs.upgradeCost[this.getBikeLevel()];
    };
    
    Storage.getBikeCost = function() {
        return this.selectedBikeSpecs.cost;
    };
    
    Storage.getBikeLevel = function() {
        return this.bikeLevels[this.selectedBike - 1];
    };
    
    Storage.getBikeLevelByIndex = function(index) {
        return this.bikeLevels[index];
    };
    
    Storage.getTwoWay = function() {
        return this.mission ? this.mission.twoWay : tr.Config.PARAMETERS.TWO_WAY;
    };
    
    Storage.getBikeSpecsByIndex = function(index) {
        return this.bikes[index].script.bikeSpecs;
    };
    
    return {
        Storage: Storage
    };
}());

Object.defineProperty(tr.Storage, "mission", {
    get: function() {
        return this._mission;
    },

    set: function(mission) {
        this._mission = mission;

        this.gameState = tr.Keys.GAME_STATES.FAILED;
        this.gameMode = mission ? mission.mode : this.gameMode;
        this.nightMode = mission ? tr.Utils.throwDice(mission.nightProb) : false;
        
        this._distance = 0;
        this._scores = 0;
        this._overtakes = 0;
        this._coins = 0;
        this._hSpeed = 0;
        this._oppDist = 0;
        this._maxCombo = 0;
        
        this._distanceRem = mission && mission.distance ? mission.distance * 1000 : 0;
        this._timeRemaining = mission ? mission.startTime : tr.Config.MODE_TIME_REMAINING;

        this.checkpoints = [];

        if (this.gameMode == tr.Keys.GAME_MODES.CHECKPOINT_RUN) {
            var cNum = mission.checkpoints + 1,
                checkpointDist = tr.Utils.precisionRound(mission.distance / cNum, 1),
                iCheckpoint;

            for (var i = 1; i <= cNum; i++) {
                iCheckpoint = i == cNum ? mission.distance :
                    tr.Utils.precisionRound(checkpointDist * i, 1);
                
                this.checkpoints.push(iCheckpoint);
            }
        }
    }
});

Object.defineProperty(tr.Storage, 'missionController', {
    get: function() {
        if (this._missionController)
            return this._missionController;
        
        this._missionController = pc.app.root.findByName('Root').script.missionController;
        
        return this._missionController;
    }
});

Object.defineProperty(tr.Storage, "acceleration", {
    get: function() {
        if (this._acceleration)
            return this._acceleration;
        
        this._acceleration = pc.app.root.findByName('Game').script.acceleration;
        
        return this._acceleration;
    }
});

Object.defineProperty(tr.Storage, "bikes", {
    get: function() {
        if (this._bikes)
            return this._bikes;
        
        this._bikes = pc.app.root.findByName('Game').findByTag('bike-entity');
        
        return this._bikes;
    }
});

Object.defineProperty(tr.Storage, "selectedBikeEntity", {
    get: function() {
        return this.bikes[this.selectedBike - 1];
    }
});

Object.defineProperty(tr.Storage, "selectedBikeSpecs", {
    get: function() {
        return this.bikes[this.selectedBike - 1].script.bikeSpecs;
    }
});

Object.defineProperty(tr.Storage, "botBikeSpecs", {
    get: function() {
        return this.bikes[this.mission.bossBike - 1].script.bikeSpecs;
    }
});

Object.defineProperty(tr.Storage, "scores", {
    get: function() {
        return this._scores || 0;
    },

    set: function(scores) {
        if (this.gameState > tr.Keys.GAME_STATES.PAUSED)
            this._scores = scores;
    }
});

Object.defineProperty(tr.Storage, "distance", {
    get: function() {
        return this._distance || 0;
    },

    set: function(distance) {
        if (this.gameState > tr.Keys.GAME_STATES.PAUSED)
            this._distance = distance;
    }
});

Object.defineProperty(tr.Storage, "distanceRem", {
    get: function() {
        return this._distanceRem || 0;
    },

    set: function(distanceRem) {
        if (this.gameState > tr.Keys.GAME_STATES.PAUSED)
            this._distanceRem = distanceRem;
    }
});

Object.defineProperty(tr.Storage, "timeRemaining", {
    get: function() {
        return this._timeRemaining || 0;
    },

    set: function(timeRemaining) {
        if (this.gameState > tr.Keys.GAME_STATES.PAUSED)
            this._timeRemaining = timeRemaining;
    }
});

Object.defineProperty(tr.Storage, "overtakes", {
    get: function() {
        return this._overtakes || 0;
    },

    set: function(overtakes) {
        if (this.gameState > tr.Keys.GAME_STATES.PAUSED)
            this._overtakes = overtakes;
    }
});

Object.defineProperty(tr.Storage, "coins", {
    get: function() {
        return this._coins || 0;
    },

    set: function(coins) {
        if (this.gameState > tr.Keys.GAME_STATES.PAUSED)
            this._coins = coins;
    }
});

Object.defineProperty(tr.Storage, "maxCombo", {
    get: function() {
        return this._maxCombo || 0;
    },

    set: function(maxCombo) {
        if (this.gameState > tr.Keys.GAME_STATES.PAUSED)
            this._maxCombo = maxCombo;
    }
});

Object.defineProperty(tr.Storage, "hSpeed", {
    get: function() {
        return this._hSpeed || 0;
    },

    set: function(hSpeed) {
        if (this.gameState > tr.Keys.GAME_STATES.PAUSED)
            this._hSpeed = hSpeed;
    }
});

Object.defineProperty(tr.Storage, "oppDist", {
    get: function() {
        return this._oppDist || 0;
    },

    set: function(oppDist) {
        if (this.gameState > tr.Keys.GAME_STATES.PAUSED)
            this._oppDist = oppDist;
    }
});

Object.defineProperty(tr.Storage, "flareModel", {
    set: function(flareModel) {
        this._flareModel = flareModel;
        
        if (this._flareResolve) {
            this._flareResolve(flareModel);
            this._flareResolve = undefined;
        }
    }
});

Object.defineProperty(tr.Storage, "level", {
    get: function () {
        return this.missionController.missions.indexOf(this.mission) + 1;
    }
});

// events.js
pc.extend(tr, function () {

    var Events = {};
    
    Events.PLAYER_OVERTAKE = 'player:overtake';
    Events.PLAYER_CHECKPOINT = 'player:checkpoint';
    Events.PLAYER_HIGH_SPEED = 'player:high-speed';
    Events.PLAYER_OPPOSING_LANE = 'player:opposing-lane';
    
    Events.CRASH_START = 'crash:start';
    Events.CRASH_RESET = 'crash:reset';
    Events.CRASH_BOT = 'crash:bot';
    
    Events.CAMERA_SHAKE = 'camera:shake';
    
    Events.COIN_COLLECTED = 'coin:collected';
    Events.COIN_THROW = 'coin:throw';
    Events.BOMB_EXPLOSION = 'bomb:explosion';
    Events.BOMB_THROW = 'bomb:throw';
    
    Events.SCREEN_LOAD = 'screen:load';
    Events.SCREEN_LOADED = 'screen:load:completed';
    Events.GARAGE_SCREEN_LOADED = 'screen:garageLoaded';
    
    Events.BIKE_UPDATE = 'bike:update';
    Events.MODEL_UPDATE = 'model:update';
    
    Events.GAME_PAUSE = 'game:pause';
    Events.GAME_RESUME = 'game:resume';
    Events.GAME_START = 'game:start';
    Events.GAME_OVER = 'game:over';
    Events.GAME_ENTER = 'game:enter';
    Events.GAME_REVIVE = 'game:revive';
    Events.GAME_COUNTDOWN = 'game:countdown';
    
    Events.GARAGE_ENTER = 'garage:enter';
    Events.GARAGE_NEXT_PAGE = 'garage:next-page';
    Events.GARAGE_MAP = 'garage:map';
    Events.GARAGE_MISSION_SET = 'garage:mission-set';
    
    Events.BIKE_LOADING_STARTED = 'garage:bike-loading-started';
    Events.BIKE_LOADING_FINISHED = 'garage:bike-loading-finished';
    
    Events.SOUND_SFX = 'sound:sfx';
    Events.SOUND_MUSIC = 'sound:music';
    
    Events.SOUND_SET_MASTER_VOLUME = 'sound:setMasterVolume';
    Events.SOUND_SET_VOLUME_MULTIPLIER = 'sound:setVolumeMultiplier';
    Events.API_ENABLE_AUDIO = 'api:enableAudio';
    Events.API_DISABLE_AUDIO = 'api:disableAudio';
    Events.API_ENABLE_MUSIC = 'api:enableMusic';
    Events.API_DISABLE_MUSIC = 'api:disableMusic';
    
    
    Events.Debug = {
        BIKE_ATTRIBUTE_CHANGED: 'debug:bike-attribute-changed' 
    };
    
    return {
        Events: Events
    };
    
}());

// car.js
pc.extend(tr, function () {

    var Car = function (template, laneIndex, direction) {
        this.entity = template.resource.instantiate();
        this.spawnPointDist = 0;
        this.laneIndex = laneIndex;
        this.direction = direction;
        this.entity.dynamics = this.dynamics;
        this.handicapSpeed = 0;
    };
    
    Object.defineProperty(Car.prototype, "dynamics", {
        get: function() {
            return this.entity.rigidbody.type == pc.BODYTYPE_DYNAMIC ? this.entity.rigidbody : 
                this.entity.script.carDynamics;
        }
    });
    
    Car.prototype.setLaneGap = function (laneGap) {
        this.laneGap = laneGap;
        this.generateZDeviation();
    };
    
    Car.prototype.generateZDeviation = function () {
        this.zDeviation = tr.Utils.getRandomNumber(-this.laneGap, this.laneGap);
        return this.zDeviation;
    };
    
    Car.prototype.break = function () {
        this.entity.script.vehicle.breakLights();
    };
    
    Car.prototype.turnStart = function (side) {
        this.entity.script.vehicle.startTurnLights(side * this.direction);
    };
    
    Car.prototype.turnStop = function () {
        this.entity.script.vehicle.stopTurnLights();
    };
    
    return {
        Car: Car
    };
    
}());

// lane.js
pc.extend(tr, function () {
    
    var Lane = function (index, direction) {
        this.index = index;
        this.z = tr.Config.LANES_Z[index];
        this.direction = direction;
        this.cars = [];
        this.playerSpawnCheckDist = 0;
    };
    
    Lane.prototype.push = function(car) {
        this.cars.push(car);
        
        this.playerSpawnCheckDist = 0;
        
        if (this.cars.length > 1)
            this.cars[this.cars.length - 2].spawnPointDist = 0;
    };
    
    Lane.prototype.pushAt = function(car, index) {
        this.cars.splice(index, 0, car);
        
        car.spawnPointDist = 0;
        
        if (this.cars.length > 1)
            this.cars[this.cars.length - 2].spawnPointDist = 0;
    };
    
    Lane.prototype.remove = function(car) {
        var index = this.cars.indexOf(car);
        
        if (index > 0) {
            this.cars[this.cars.length - 2].spawnPointDist = 0;
            this.playerSpawnCheckDist = 0;
        }
        
        if (index >= 0)
            this.cars.splice(index, 1);
    };
    
    Lane.prototype.getLastCar = function() {
        if (!this.cars.length)
            return null;
        
        return this.cars[this.cars.length - 1];
    };
    
    Lane.prototype.getFirstCar = function() {
        if (!this.cars.length)
            return null;
        
        return this.cars[0];
    };
    
    Lane.prototype.checkFreeSpace = function(targetX) {
        var carPos,
            index,
            i;
        
        for (i = 0; i < this.cars.length; i++) {
            carPos = this.cars[i].entity.getPosition();
            
            if (tr.Utils.isInRange(targetX - tr.Config.MIN_CAR_DIST, targetX + tr.Config.MIN_CAR_DIST, carPos.x))
                return false;
            
            if (targetX > carPos.x)
                index = i + 1;
        }
        
        return index;
    };
    
    return {
        Lane: Lane
    };
    
}());

// acceleration.js
var Acceleration = pc.createScript('acceleration');

Acceleration.attributes.add('camera', {
    type: 'entity',
    description: 'Assign a camera entity'
});

Acceleration.attributes.add('bodyMovement', {
    type: 'entity',
    description: 'Assign a body movement x physics'
});

Acceleration.attributes.add('player', {
    type: 'entity',
    description: 'The player'
});

// initialize code called once per entity
Acceleration.prototype.initialize = function() {
    this.DAMPING = 0.1;
    this.VELOCITY_LOSS = 10;
    this.SOUND_COOLDOWN = 1;
    this.bodyPower = 6000;
    this.bodyForce = new pc.Vec3(0, 0, 0);
    this.isHighSpeed = false;
    this.cooldownTime = 0;
    
    var onCollision = function (e) {
            if (this.cooldownTime < this.SOUND_COOLDOWN)
                return;
            
            //if (e.other.name == 'Car')
                tr.SoundController.play(tr.Keys.SOUNDS.CAR_CRASH);
            //else 
                tr.SoundController.play(tr.Keys.SOUNDS.FENCE_CRASH);
        
            this.cooldownTime = 0;
        }.bind(this),
        
        onEnable = function() {
            this.MAX_SPEED = tr.Utils.kmhToMs(tr.Storage.getMaxSpeed());
            this.run();
            this.onHold = true;
        }.bind(this),
        
        onDisable = function() {
            this.stop();
        }.bind(this),
    
        onGameStart = function() {
            this.onHold = false;
        }.bind(this);
    
    this.player.rigidbody.on('collisionstart', onCollision);
    
    this.on('enable', onEnable);
    this.on('disable', onDisable);
    this.app.on(tr.Events.GAME_START, onGameStart);
    
    this.on('destroy', function () {
        this.player.rigidbody.off('collisionstart', onCollision);
    }.bind(this));
    
    onEnable();
};

Acceleration.prototype.doCollisionBrake = function(normal, other) {
    var vLoss,
        vNew;
    
    if (Math.abs(normal.x) >= 0.5 && other.dynamics)
        vNew = Math.max(tr.Config.MIN_SPEED, this.velocity - Math.abs(other.dynamics.linearVelocity.x - 2));
    else
        vNew = Math.max(tr.Config.MIN_SPEED, this.velocity - this.VELOCITY_LOSS);
    
    vLoss = this.velocity - vNew;

    this.velocity = vNew;
    
    return other.dynamics && this.velocity == tr.Config.MIN_SPEED && other.dynamics.linearVelocity.x <= 0 ? false : true;
};

Acceleration.prototype.run = function() {
    this.running = true;
    this.velocity = tr.Config.MIN_SPEED;
};

Acceleration.prototype.isRunning = function() {
    return this.running;
};

Acceleration.prototype.stop = function() {
    this.running = false;
    this.velocity = 0;
    
    if (this.isHighSpeed) {
        this.isHighSpeed = false;
        this.app.fire(tr.Events.PLAYER_HIGH_SPEED, this.isHighSpeed);
    }
};

Acceleration.prototype.isBreaking = function() {
    var app = this.app,
        playerPosZ = this.player.getPosition().z;
    
    return app.keyboard.isPressed(pc.KEY_DOWN) || app.keyboard.isPressed(pc.KEY_SPACE) || tr.Touch.down || 
        Math.abs(playerPosZ) >= tr.Config.ROAD_BORDER - 0.01;
};

Acceleration.prototype.update = function(dt) {
    this.throttling = false;
    
    if (!this.running)
        return;
    
    var forward = this.camera.forward,
        x = 0,
        app = this.app,
        damping = 1,
        power;
    
    if (this.isBreaking() && this.velocity > tr.Config.MIN_SPEED)
        x -= forward.x;
    else if ((app.keyboard.isPressed(pc.KEY_UP) || tr.Touch.up || tr.Config.PARAMETERS.AUTO_THROTTLE) && 
        this.velocity < this.MAX_SPEED && !this.isBreaking())
        x += forward.x;
    
    power = x > 0 ? tr.Storage.getPower() : tr.Storage.getBreaking();
    
    if (x && !this.onHold) {
        damping = x < 0 ? 1 : (1 - this.velocity / this.MAX_SPEED);
        this.velocity += x * power * dt * damping;
        this.bodyForce.x = this.bodyPower * x;
        this.bodyMovement.rigidbody.applyForce(this.bodyForce);
        this.throttling = x > 0;
    } else if (this.velocity < tr.Config.MIN_SPEED) {
        this.velocity = tr.Config.MIN_SPEED;
    } else {
        this.velocity -= this.velocity * this.DAMPING * dt;
    }
    
    if (this.velocity >= tr.Config.HIGH_SPEED && !this.isHighSpeed) {
        this.isHighSpeed = true;
        this.app.fire(tr.Events.PLAYER_HIGH_SPEED, this.isHighSpeed);
    } else if (this.velocity < tr.Config.HIGH_SPEED && this.isHighSpeed) {
        this.isHighSpeed = false;
        this.app.fire(tr.Events.PLAYER_HIGH_SPEED, this.isHighSpeed);
    }
    
    this.cooldownTime += dt;
};

// tile-controller.js
var TileController = pc.createScript('tileController');

TileController.attributes.add('bike', {
    type: 'entity',
    description: 'Acceleration entity'
});

TileController.attributes.add('groundTile', {
    type: 'entity',
    description: 'Ground entity'
});

// initialize code called once per entity
TileController.prototype.postInitialize = function() {
    var tileTemplate = this.app.assets.find('Ground Tile', 'template'),
        initPosition = this.groundTile.getPosition().clone(),
        newTile,
        i,
        
        onEnable = function () {
            this.tiles.forEach(function(tile, index) {
                var tilePosition = initPosition.clone();
                
                tilePosition.x += index * this.tileLength;
                tile.rigidbody.teleport(tilePosition);
                tile.script.tile.reset(this.getBiome(), this.getCheckpoint(index));
            }.bind(this));
        }.bind(this);
    
    this.TILE_NUM = 4;
    
    this.acceleration = tr.Storage.acceleration;
    this.tiles = [this.groundTile];
    this.tileLength = 100;
    
    this.fTilePos = new pc.Vec3();
    this.tilePos = new pc.Vec3();
    
    for (i = 0; i < this.TILE_NUM - 1; i++) {
        newTile = tileTemplate.resource.instantiate();
        this.tiles.push(newTile);
        this.groundTile.parent.addChild(newTile);
        newTile.enabled = true;
    }
    
    this.on('enable', onEnable);
    
    onEnable();
};

TileController.prototype.getBiome = function () {
    if (!this.biomeLength || this.biomeLength == this.biomeTile) {
        this.biome = tr.Keys.BIOMES[tr.Utils.getRandomValue(Object.keys(tr.Keys.BIOMES))];
        this.biomeLength = this.biome != tr.Keys.BIOMES.CROSSROAD ? tr.Utils.getRandomInt(5, 8) : 1;
        this.biomeTile = 1;
        
        return this.biome;
    }
        
    this.biomeTile++;
    
    return this.biome;
};

TileController.prototype.getCheckpoint = function(tileIndex) {
    var tileRoutePos = Math.round(tr.Storage.distance / 100) * 100 + (this.tileLength * tileIndex),
        chpIndex = tr.Storage.checkpoints.indexOf(tileRoutePos / 1000),
        checkpoint;

    if (chpIndex < 0)
        checkpoint = 0;
    else if (chpIndex == tr.Storage.checkpoints.length - 1)
        checkpoint = 2;
    else if (chpIndex > -1)
        checkpoint = 1;
    
    return checkpoint;
};

// update code called every frame
TileController.prototype.update = function(dt) {
    var bikePos = this.bike.getPosition(),
        firstTile = this.tiles[0],
        dS = dt * this.acceleration.velocity,
        fTilePos,
        tilePos;
    
    if (tr.Storage.gameState > tr.Keys.GAME_STATES.PAUSED) {
        tr.Storage.distance += dS;
        tr.Storage.distanceRem -= dS;
    }
    
    this.tiles.forEach(function (tile, index) {
        tilePos = this.tilePos.copy(tile.getPosition());
        tilePos.x -= dS;
        tile.rigidbody.teleport(tilePos);
    }.bind(this));
    
    fTilePos = this.fTilePos.copy(firstTile.getPosition());
    
    if (bikePos.x > (fTilePos.x + this.tileLength / 2)) {
        fTilePos.x += this.tileLength * this.tiles.length;
        firstTile.rigidbody.teleport(fTilePos);
        firstTile.script.tile.reset(this.getBiome(), this.getCheckpoint(this.TILE_NUM - 1));
        
        this.tiles.push(this.tiles.shift());
        
        //console.log('teleport');
    }
};

// player.js
var Player = pc.createScript('player');

Player.attributes.add('collision', {
    type: 'entity',
    description: 'Collision shake physics entity'
});

Player.attributes.add('headRotation', {
    type: 'entity',
    description: 'Head rotation physics entity'
});

Player.attributes.add('handling', {
    type: 'entity',
    description: 'Handling physics entity'
});

Player.attributes.add('bodyMovement', {
    type: 'entity',
    description: 'Rider x movement'
});

Player.attributes.add('camera', {
    type: 'entity',
    description: 'Player camera'
});

Player.attributes.add('rider', {
    type: 'entity',
    description: 'The rider'
});

Player.attributes.add('zSpeedSlope', {
    type: 'number',
    default: 0.015,
    description: 'Relevance between x and z speed'
});

Player.attributes.add('lFov', {
    type: 'number',
    default: 45,
    description: 'Landscape camera fov'
});

Player.attributes.add('pFov', {
    type: 'number',
    default: 75,
    description: 'Portrait camera fov'
});

Player.attributes.add('speedEffect', {
    type: 'number',
    default: 0.2,
    description: 'Speed influence on fov in landscape'
});

Player.attributes.add('speedEffectPort', {
    type: 'number',
    default: 0.2,
    description: 'Speed influence on fov in portrait'
});

Player.attributes.add('horizontalFov', {
    type: 'boolean',
    default: false,
    description: 'Camera horizontalFov in landscape'
});

Player.attributes.add('horizontalFovPort', {
    type: 'boolean',
    default: false,
    description: 'Camera horizontalFov in portrait'
});

// initialize code called once per entity
Player.prototype.initialize = function() {  
    this.playerPosInit = this.entity.getPosition().clone();
    
    this.acceleration = tr.Storage.acceleration;
    
    this.camLPos = this.camera.getLocalPosition().clone();
    this.camLEul = this.camera.getLocalEulerAngles().clone();
    
    var onResizeCanvas = function () {
            this.toggleMode();
        }.bind(this),
    
        onEnable = function () {
            this.onHold = true;
            this.app.graphicsDevice.on('resizecanvas', onResizeCanvas);
            
            this.reset();
        }.bind(this),
        
        onDisable = function () {
            this.app.graphicsDevice.off('resizecanvas', onResizeCanvas);
        }.bind(this),
        
        onGameStart = function() {
            this.onHold = false;
        }.bind(this),
        
        onAttr = function(attributeName, value, prevValue) {
            this.app.fire(tr.Events.Debug.BIKE_ATTRIBUTE_CHANGED, attributeName, value);
        };
    
    this.on('enable', onEnable);
    this.on('disable', onDisable);
    this.on('attr', onAttr);
    
    this.app.on(tr.Events.GAME_START, onGameStart);
    this.app.on(tr.Events.Debug.BIKE_ATTRIBUTE_CHANGED, this.onBikeAttributeChanged, this);
    
    this.on('destroy', function () {
        this.app.graphicsDevice.off('resizecanvas', onResizeCanvas);
    }.bind(this));
    
    this.entity.rigidbody.on('collisionstart', function (e) {
        if (e.other.name == 'Bot') {
            this.impulse = 3 * (e.other.script.bot.dZ - this.dZ);
        } else {
            this.impulse = -this.dZ * 2;
        }

    }.bind(this));
    
    onEnable();
};

Player.prototype.toggleMode = function () {
    if (tr.Utils.isLandscape())
        this.setLandscape();
    else
        this.setPortrait();
};

Player.prototype.setLandscape = function () {
    this.riderPosInit.x = tr.Storage.selectedBikeSpecs.riderPosition.x;
    this.riderPosInit.y = tr.Storage.selectedBikeSpecs.riderPosition.y;

    this.camLEul.x = tr.Storage.selectedBikeSpecs.camPitchLand;
    this.currentFov = this.lFov;
    this.currentSpeedEffect = this.speedEffect;
    this.camera.camera.horizontalFov = this.horizontalFov;
};

Player.prototype.setPortrait = function () {
    this.riderPosInit.x = tr.Storage.selectedBikeSpecs.riderPositionPort.x;
    this.riderPosInit.y = tr.Storage.selectedBikeSpecs.riderPositionPort.y;

    this.camLEul.x = tr.Storage.selectedBikeSpecs.camPitchPort;
    this.currentFov = this.pFov;
    this.currentSpeedEffect = this.speedEffectPort;
    this.camera.camera.horizontalFov = this.horizontalFovPort;
};

Player.prototype.reset = function () {
    var bikes = tr.Storage.bikes,
        aabb;
    
    bikes.forEach(function (bike, index) {
        bike.enabled = false;
    });
    
    this.bike = tr.Storage.selectedBikeEntity;
    this.bikeBody = this.bike.findByName('Body');
    this.handlebar = this.bike.findByName('Handlebar');
    this.hbModel = this.bike.findByName('HBModel');
    this.hands = this.bike.findByName('Hands');
    this.blobCont = this.bike.findByName('BlobContainer');
    
    if (this.blobCont)
        this.blobCont.enabled = false;
    
    this.bike.enabled = true;
    
    aabb = tr.Utils.getAABB(this.hbModel);
    
    this.entity.collision.height = aabb.halfExtents.x * 2 * tr.Storage.selectedBikeSpecs.colliderScale;
    //this.entity.collision.radius = aabb.halfExtents.z;
    
    var riderPos = tr.Storage.selectedBikeSpecs.riderPosition;
    this.rider.setLocalPosition(riderPos.x, riderPos.y, 0);
    
    // CCD only applies to dynamic bodies and won’t work if enabled on kinematic bodies
    var body = this.entity.rigidbody.body;
    // Number of meters moved in one frame before CCD is enabled
    body.setCcdMotionThreshold(0);
    // This should be below the half extent of the collision volume. E.g For an object of dimensions 1 meter, try 0.2
    body.setCcdSweptSphereRadius(0.02);
    
    this.bikeBodyEulInit = this.bikeBody.getLocalEulerAngles().clone();
    this.bikeEulInit = this.bike.getLocalEulerAngles().clone();
    
    this.collisionEulInit = this.collision.getLocalEulerAngles().clone();
    this.bikePosInit = this.bike.getLocalPosition().clone();
    this.riderPosInit = this.rider.getLocalPosition().clone();
    
    this.handLocalEulers = new pc.Vec3();
    this.collisionPos = new pc.Vec3();
    this.riderLocalPos = new pc.Vec3();
    this.bikeLocalPos = new pc.Vec3();
    
    this.dZ = 0;
    this.impulse = 0;
    this.isOpposingLane = false;
    
    this.max_speed = tr.Utils.kmhToMs(tr.Storage.getMaxSpeed());
    
    this.entity.setPosition(this.playerPosInit);
    
    this.toggleMode();
    
    this.revived = false;
};

Player.prototype.missionPassed = function() {
    tr.Storage.gameState = tr.Keys.GAME_STATES.PASSED;
            
    this.app.fire(tr.Events.GAME_OVER);
};

Player.prototype.missionFailed = function() {
    tr.Storage.gameState = tr.Keys.GAME_STATES.FAILED;

    this.app.fire(tr.Events.GAME_OVER);
};

Player.prototype.updateMissionProgress = function (dt) {
    if (tr.Storage.gameState < tr.Keys.GAME_STATES.COUNTDOWN)
        return;
    
    var playerPos = this.entity.getPosition(),
        speed = this.acceleration.velocity,
        dS = speed * dt;
    
    tr.Storage.scores += dS * tr.Config.POINTS_PER_M * (speed >= tr.Config.MIN_REWARD_SPEED) * 
        (this.acceleration.isHighSpeed ? 2 : 1) * (this.isOpposingLane ? 2 : 1);
    
    if (speed >= tr.Config.HIGH_SPEED)
        tr.Storage.hSpeed += dt;
    
    if (this.isOpposingLane)
        tr.Storage.oppDist += dt;
    
    if (tr.Storage.gameMode != tr.Keys.GAME_MODES.ENDLESS && !this.onHold) {
        tr.Storage.timeRemaining -= dt;

        if (tr.Storage.timeRemaining <= 0 && tr.Storage.gameState == tr.Keys.GAME_STATES.ACTIVE) {
            if (!this.revived && Apicontroller.hasRewardedVideo()) {
                this.revived = true;
                this.app.fire(tr.Events.GAME_REVIVE);
            } else {
                this.missionFailed();
            }
            
            return;
        }
    }
    
    if (tr.Storage.checkpoints.length && tr.Storage.distance >= tr.Storage.checkpoints[0] * 1000) {
        if (tr.Storage.checkpoints.length == 1) {
            this.missionPassed();
            return;
        } else {
            tr.Storage.checkpoints.shift();
            tr.Storage.timeRemaining += tr.Storage.mission.addTime;
            this.app.fire(tr.Events.PLAYER_CHECKPOINT, tr.Storage.mission.addTime);
        }
    }
};

// update code called every frame
Player.prototype.update = function(dt) {
    var playerPos = this.entity.getPosition(),
        bodyPos = this.bodyMovement.getLocalPosition(),
        handEul = this.handling.getLocalEulerAngles().x,
        headEul = this.headRotation.getLocalEulerAngles().x * tr.Storage.selectedBikeSpecs.camTiltFactor,
        handLocalEulers = this.handLocalEulers.copy(this.handlebar.getLocalEulerAngles()),
        speed = this.acceleration.velocity,
        collisionPos = this.collisionPos.copy(this.collision.getLocalEulerAngles()).sub(this.collisionEulInit),
        riderMovementFactor = tr.Storage.selectedBikeSpecs.riderMovementFactor,
        camTiltToHangRatio = tr.Storage.selectedBikeSpecs.camTiltToHangRatio,
        bikeTiltRatio = tr.Storage.selectedBikeSpecs.bikeTiltRatio,
        bikeTurnRatio = tr.Storage.selectedBikeSpecs.bikeTurnRatio,
        fovRatio = 1 + this.currentSpeedEffect * tr.Utils.normalize(tr.Config.MIN_SPEED, this.max_speed, speed);
    
    if (playerPos.z < 0 && !this.isOpposingLane && speed && tr.Storage.getTwoWay()) {
        this.isOpposingLane = true;
        this.app.fire(tr.Events.PLAYER_OPPOSING_LANE, this.isOpposingLane);
    } else if ((playerPos.z > 0 || !speed) && this.isOpposingLane) {
        this.isOpposingLane = false;
        this.app.fire(tr.Events.PLAYER_OPPOSING_LANE, this.isOpposingLane);
    }
    
    handLocalEulers.y = -handEul;
    
                                    // Math.pow(speed, 1 / 5)
    this.dZ = -handLocalEulers.y * (this.zSpeedSlope * speed + 1.3) * this.app.timeScale * 
        tr.Storage.selectedBikeSpecs.handling / 10000 + this.impulse;
    
    this.impulse *= 0.9;
    
    //this.heul = Math.max(this.heul || 0, handEul);
    //this.dbg.text = bodyPos.x; //this.heul;
    //this.dbg2.text = headEul;
     
    this.camera.camera.fov = this.currentFov * fovRatio;
    
    this.camera.setLocalPosition(this.camLPos.x + handEul / riderMovementFactor.x + headEul / camTiltToHangRatio, 
                                 this.camLPos.y - Math.abs(handEul) / riderMovementFactor.y,
                                 this.camLPos.z + bodyPos.x);
    this.camera.setLocalEulerAngles(this.camLEul.x, this.camLEul.y, this.camLEul.z - headEul);
    this.entity.setPosition(playerPos.x, playerPos.y, tr.Utils.bound(playerPos.z + this.dZ, tr.Config.ROAD_BORDER));
    
    this.bikeBody.setLocalEulerAngles(handEul * bikeTiltRatio, -handEul * bikeTurnRatio, this.bikeBodyEulInit.z);
    
    this.rider.setLocalPosition(this.riderLocalPos.copy(this.riderPosInit).add(collisionPos.scale(-1)));
    this.bike.setLocalPosition(this.bikeLocalPos.copy(this.bikePosInit).add(collisionPos.scale(2)));
    
    this.handlebar.setLocalEulerAngles(handLocalEulers);
    
    this.updateMissionProgress(dt);
};


Player.prototype.onBikeAttributeChanged = function (attributeKey, attributeValue) {
    console.log('Bike attribute changed ' + attributeKey + ': ', attributeValue);
    this.reset();
};

// touch-input.js
var TouchInput = pc.createScript('touchInput');

TouchInput.attributes.add('controlType', {
    type: 'string',
    enum: [
        { 'UP': 'up' },
        { 'DOWN': 'down' },
        { 'LEFT': 'left' },
        { 'RIGHT': 'right' }
    ],
    description: 'Control type'
});

// initialize code called once per entity
TouchInput.prototype.initialize = function() {
    var touch = this.app.touch;
    
    if (touch) {
        this.entity.element.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.entity.element.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        this.entity.element.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        this.entity.element.on(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);
    }
    
    this.on('destroy', function () {
        this.entity.element.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.entity.element.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        this.entity.element.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        this.entity.element.off(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);
    }.bind(this));
};

TouchInput.prototype.onTouchStart = function (event) {
    tr.Touch[this.controlType] = true;
    
    // Needs to be called to remove 300ms delay and stop 
    // browsers consuming the event for something else
    // such as zooming in
    event.event.preventDefault();
};


TouchInput.prototype.onTouchMove = function (event) {
    // Use only the first touch screen x y position to move the entity
    
    event.event.preventDefault();
};


TouchInput.prototype.onTouchEnd = function (event) {
    // Change the material only if the last touch has ended
    tr.Touch[this.controlType] = false;
    
    event.event.preventDefault();
};


TouchInput.prototype.onTouchCancel = function (event) {
    // Change the material only if the last touch has ended
    tr.Touch[this.controlType] = false;
    
    event.event.preventDefault();
};

// touch.js
pc.extend(tr, function () {

    var Touch = {};

    Touch.up = false;
    Touch.down = false;
    Touch.left = false;
    Touch.right = false;
    
    return {
        Touch: Touch
    };
}());

// fps.js
var Fps = pc.createScript('fps');

// Just add this script to any object in the scene (usually Root) and it will 
// appear in the app as HTML overlay

if (typeof(document) !== "undefined") {
    /*! FPSMeter 0.3.1 - 9th May 2013 | https://github.com/Darsain/fpsmeter */
    (function(m,j){function s(a,e){for(var g in e)try{a.style[g]=e[g]}catch(j){}return a}function H(a){return null==a?String(a):"object"===typeof a||"function"===typeof a?Object.prototype.toString.call(a).match(/\s([a-z]+)/i)[1].toLowerCase()||"object":typeof a}function R(a,e){if("array"!==H(e))return-1;if(e.indexOf)return e.indexOf(a);for(var g=0,j=e.length;g<j;g++)if(e[g]===a)return g;return-1}function I(){var a=arguments,e;for(e in a[1])if(a[1].hasOwnProperty(e))switch(H(a[1][e])){case "object":a[0][e]=
    I({},a[0][e],a[1][e]);break;case "array":a[0][e]=a[1][e].slice(0);break;default:a[0][e]=a[1][e]}return 2<a.length?I.apply(null,[a[0]].concat(Array.prototype.slice.call(a,2))):a[0]}function N(a){a=Math.round(255*a).toString(16);return 1===a.length?"0"+a:a}function S(a,e,g,j){if(a.addEventListener)a[j?"removeEventListener":"addEventListener"](e,g,!1);else if(a.attachEvent)a[j?"detachEvent":"attachEvent"]("on"+e,g)}function D(a,e){function g(a,b,d,c){return y[0|a][Math.round(Math.min((b-d)/(c-d)*J,J))]}
    function r(){f.legend.fps!==q&&(f.legend.fps=q,f.legend[T]=q?"FPS":"ms");K=q?b.fps:b.duration;f.count[T]=999<K?"999+":K.toFixed(99<K?0:d.decimals)}function m(){z=A();L<z-d.threshold&&(b.fps-=b.fps/Math.max(1,60*d.smoothing/d.interval),b.duration=1E3/b.fps);for(c=d.history;c--;)E[c]=0===c?b.fps:E[c-1],F[c]=0===c?b.duration:F[c-1];r();if(d.heat){if(w.length)for(c=w.length;c--;)w[c].el.style[h[w[c].name].heatOn]=q?g(h[w[c].name].heatmap,b.fps,0,d.maxFps):g(h[w[c].name].heatmap,b.duration,d.threshold,
    0);if(f.graph&&h.column.heatOn)for(c=u.length;c--;)u[c].style[h.column.heatOn]=q?g(h.column.heatmap,E[c],0,d.maxFps):g(h.column.heatmap,F[c],d.threshold,0)}if(f.graph)for(p=0;p<d.history;p++)u[p].style.height=(q?E[p]?Math.round(O/d.maxFps*Math.min(E[p],d.maxFps)):0:F[p]?Math.round(O/d.threshold*Math.min(F[p],d.threshold)):0)+"px"}function k(){20>d.interval?(x=M(k),m()):(x=setTimeout(k,d.interval),P=M(m))}function G(a){a=a||window.event;a.preventDefault?(a.preventDefault(),a.stopPropagation()):(a.returnValue=
    !1,a.cancelBubble=!0);b.toggle()}function U(){d.toggleOn&&S(f.container,d.toggleOn,G,1);a.removeChild(f.container)}function V(){f.container&&U();h=D.theme[d.theme];y=h.compiledHeatmaps||[];if(!y.length&&h.heatmaps.length){for(p=0;p<h.heatmaps.length;p++){y[p]=[];for(c=0;c<=J;c++){var b=y[p],e=c,g;g=0.33/J*c;var j=h.heatmaps[p].saturation,m=h.heatmaps[p].lightness,n=void 0,k=void 0,l=void 0,t=l=void 0,v=n=k=void 0,v=void 0,l=0.5>=m?m*(1+j):m+j-m*j;0===l?g="#000":(t=2*m-l,k=(l-t)/l,g*=6,n=Math.floor(g),
    v=g-n,v*=l*k,0===n||6===n?(n=l,k=t+v,l=t):1===n?(n=l-v,k=l,l=t):2===n?(n=t,k=l,l=t+v):3===n?(n=t,k=l-v):4===n?(n=t+v,k=t):(n=l,k=t,l-=v),g="#"+N(n)+N(k)+N(l));b[e]=g}}h.compiledHeatmaps=y}f.container=s(document.createElement("div"),h.container);f.count=f.container.appendChild(s(document.createElement("div"),h.count));f.legend=f.container.appendChild(s(document.createElement("div"),h.legend));f.graph=d.graph?f.container.appendChild(s(document.createElement("div"),h.graph)):0;w.length=0;for(var q in f)f[q]&&
    h[q].heatOn&&w.push({name:q,el:f[q]});u.length=0;if(f.graph){f.graph.style.width=d.history*h.column.width+(d.history-1)*h.column.spacing+"px";for(c=0;c<d.history;c++)u[c]=f.graph.appendChild(s(document.createElement("div"),h.column)),u[c].style.position="absolute",u[c].style.bottom=0,u[c].style.right=c*h.column.width+c*h.column.spacing+"px",u[c].style.width=h.column.width+"px",u[c].style.height="0px"}s(f.container,d);r();a.appendChild(f.container);f.graph&&(O=f.graph.clientHeight);d.toggleOn&&("click"===
    d.toggleOn&&(f.container.style.cursor="pointer"),S(f.container,d.toggleOn,G))}"object"===H(a)&&a.nodeType===j&&(e=a,a=document.body);a||(a=document.body);var b=this,d=I({},D.defaults,e||{}),f={},u=[],h,y,J=100,w=[],W=0,B=d.threshold,Q=0,L=A()-B,z,E=[],F=[],x,P,q="fps"===d.show,O,K,c,p;b.options=d;b.fps=0;b.duration=0;b.isPaused=0;b.tickStart=function(){Q=A()};b.tick=function(){z=A();W=z-L;B+=(W-B)/d.smoothing;b.fps=1E3/B;b.duration=Q<L?B:z-Q;L=z};b.pause=function(){x&&(b.isPaused=1,clearTimeout(x),
    C(x),C(P),x=P=0);return b};b.resume=function(){x||(b.isPaused=0,k());return b};b.set=function(a,c){d[a]=c;q="fps"===d.show;-1!==R(a,X)&&V();-1!==R(a,Y)&&s(f.container,d);return b};b.showDuration=function(){b.set("show","ms");return b};b.showFps=function(){b.set("show","fps");return b};b.toggle=function(){b.set("show",q?"ms":"fps");return b};b.hide=function(){b.pause();f.container.style.display="none";return b};b.show=function(){b.resume();f.container.style.display="block";return b};b.destroy=function(){b.pause();
    U();b.tick=b.tickStart=function(){}};V();k()}var A,r=m.performance;A=r&&(r.now||r.webkitNow)?r[r.now?"now":"webkitNow"].bind(r):function(){return+new Date};for(var C=m.cancelAnimationFrame||m.cancelRequestAnimationFrame,M=m.requestAnimationFrame,r=["moz","webkit","o"],G=0,k=0,Z=r.length;k<Z&&!C;++k)M=(C=m[r[k]+"CancelAnimationFrame"]||m[r[k]+"CancelRequestAnimationFrame"])&&m[r[k]+"RequestAnimationFrame"];C||(M=function(a){var e=A(),g=Math.max(0,16-(e-G));G=e+g;return m.setTimeout(function(){a(e+
    g)},g)},C=function(a){clearTimeout(a)});var T="string"===H(document.createElement("div").textContent)?"textContent":"innerText";D.extend=I;window.FPSMeter=D;D.defaults={interval:100,smoothing:10,show:"fps",toggleOn:"click",decimals:1,maxFps:60,threshold:100,position:"absolute",zIndex:10,left:"5px",top:"5px",right:"auto",bottom:"auto",margin:"0 0 0 0",theme:"dark",heat:0,graph:0,history:20};var X=["toggleOn","theme","heat","graph","history"],Y="position zIndex left top right bottom margin".split(" ")})(window);(function(m,j){j.theme={};var s=j.theme.base={heatmaps:[],container:{heatOn:null,heatmap:null,padding:"5px",minWidth:"95px",height:"30px",lineHeight:"30px",textAlign:"right",textShadow:"none"},count:{heatOn:null,heatmap:null,position:"absolute",top:0,right:0,padding:"5px 10px",height:"30px",fontSize:"24px",fontFamily:"Consolas, Andale Mono, monospace",zIndex:2},legend:{heatOn:null,heatmap:null,position:"absolute",top:0,left:0,padding:"5px 10px",height:"30px",fontSize:"12px",lineHeight:"32px",fontFamily:"sans-serif",
    textAlign:"left",zIndex:2},graph:{heatOn:null,heatmap:null,position:"relative",boxSizing:"padding-box",MozBoxSizing:"padding-box",height:"100%",zIndex:1},column:{width:4,spacing:1,heatOn:null,heatmap:null}};j.theme.dark=j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.8}],container:{background:"#222",color:"#fff",border:"1px solid #1a1a1a",textShadow:"1px 1px 0 #222"},count:{heatOn:"color"},column:{background:"#3f3f3f"}});j.theme.light=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.5}],
    container:{color:"#666",background:"#fff",textShadow:"1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},count:{heatOn:"color"},column:{background:"#eaeaea"}});j.theme.colorful=j.extend({},s,{heatmaps:[{saturation:0.5,lightness:0.6}],container:{heatOn:"backgroundColor",background:"#888",color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.2)",boxShadow:"0 0 0 1px rgba(0,0,0,.1)"},column:{background:"#777",backgroundColor:"rgba(0,0,0,.2)"}});j.theme.transparent=
    j.extend({},s,{heatmaps:[{saturation:0.8,lightness:0.5}],container:{padding:0,color:"#fff",textShadow:"1px 1px 0 rgba(0,0,0,.5)"},count:{padding:"0 5px",height:"40px",lineHeight:"40px"},legend:{padding:"0 5px",height:"40px",lineHeight:"42px"},graph:{height:"40px"},column:{width:5,background:"#999",heatOn:"backgroundColor",opacity:0.5}})})(window,FPSMeter);    
}

// initialize code called once per entity
Fps.prototype.initialize = function() {
    var urlParams = new URLSearchParams(window.location.search),
        fpsEnabled = urlParams.get('fps');
    
    if (fpsEnabled === 'true')
        this.fps = new FPSMeter({heat: true, graph: true});
    else
        this.enabled = false;
};

// update code called every frame
Fps.prototype.update = function(dt) {
    this.fps.tick();
};

// performance-controller.js
var PerformanceController = pc.createScript('performanceController');

PerformanceController.attributes.add('minFps', {
    type: 'number',
    default: 30,
    description: 'Minimum fps to switch dpf'
});

PerformanceController.attributes.add('timeBand', {
    type: 'number',
    default: 1,
    description: 'Time frame for averaging FPS'
});

// initialize code called once per entity
PerformanceController.prototype.initialize = function() {
    //this.pixelRatioHud = this.entity.findByName('PixelRatio').element;
    //this.pixelRatioHud.text = 'PixelRatio: ' + this.app.graphicsDevice.maxPixelRatio;
    
    this.minDt = 1 / this.minFps;
    this.framesCount = 0;
    this.framesSum = 0;
};

// update code called every frame
PerformanceController.prototype.update = function(dt) {
    this.framesSum += dt;
    this.framesCount++;
        
    if (this.framesSum >= this.timeBand) {
        var frameAve;
        
        frameAve = this.framesSum / this.framesCount;
        
        if (frameAve > this.minDt) {

            this.app.graphicsDevice.maxPixelRatio = 1;
            this.enabled = false;

            //this.pixelRatioHud.text = 'PixelRatio: ' + this.app.graphicsDevice.maxPixelRatio;
            window.famobi.log("set pixel ratio to 1");
            
            return;
        }
        
        this.framesCount = 0;
        this.framesSum = 0;
    }
};

// position-scale-fix.js
var PositionScaleFix = pc.createScript('positionScaleFix');

// initialize code called once per entity
PositionScaleFix.prototype.initialize = function() {
    var sc = Math.pow(this.entity.parent.screen.scale, -1) * pc.app.graphicsDevice.maxPixelRatio;
        
    this.entity.getLocalPosition().scale(sc);
};

// generic-6-dof-constraint.js
var Generic6DofConstraint = pc.createScript('generic6DofConstraint');

Generic6DofConstraint.attributes.add('linearLowerLimit', {
    title: 'Linear lower limit',
    description: 'Lower linear constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});
Generic6DofConstraint.attributes.add('linearUpperLimit', {
    title: 'Linear upper limit',
    description: 'Upper linear constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});

Generic6DofConstraint.attributes.add('angularLowerLimit', {
    title: 'Angular lower limit',
    description: 'Lower angular constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});
Generic6DofConstraint.attributes.add('angularUpperLimit', {
    title: 'Angular upper limit',
    description: 'Upper angular constraint in the local space of this entity.',
    type: 'vec3',
    default: [0, 0, 0]
});

Generic6DofConstraint.attributes.add('enableCollision', {
    title: 'Enable Collision',
    description: 'Enable collision between linked rigid bodies.',
    type: 'boolean',
    default: true
});

// initialize code called once per entity
Generic6DofConstraint.prototype.initialize = function() {
    var v1 = new pc.Vec3(),
        v2 = new pc.Vec3(),
        q = new pc.Quat(),
        m = new pc.Mat4(),
        axisA = new pc.Vec3(0, 0, 0),
        bodyA = this.entity.rigidbody.body,
        pivotA = new Ammo.btVector3(0, 0, 0),
        localPosition = this.entity.getLocalPosition();

    tr.Utils.getOrthogonalVectors(axisA, v1, v2);
    m.set([
        axisA.x, axisA.y, axisA.z, 0,
        v1.x, v1.y, v1.z, 0,
        v2.x, v2.y, v2.z, 0,
        0, 0, 0, 1
    ]);
    q.setFromMat4(m);

    var quatA = new Ammo.btQuaternion(q.x, q.y, q.z, q.w);
    var frameA = new Ammo.btTransform(quatA, pivotA);
    frameA.setOrigin(pivotA);
    
    this.linearLowerLimit.x -= localPosition.x;
    this.linearUpperLimit.x -= localPosition.x;
    
    this.constraint = new Ammo.btGeneric6DofConstraint(bodyA, frameA);
    
    this.constraint.setLinearLowerLimit(new Ammo.btVector3(this.linearLowerLimit.x, 
                                                           this.linearLowerLimit.y, 
                                                           this.linearLowerLimit.z));
    
    this.constraint.setLinearUpperLimit(new Ammo.btVector3(this.linearUpperLimit.x, 
                                                           this.linearUpperLimit.y, 
                                                           this.linearUpperLimit.z));
    
    this.constraint.setAngularLowerLimit(new Ammo.btVector3(this.angularLowerLimit.x, 
                                                            this.angularLowerLimit.y, 
                                                            this.angularLowerLimit.z));
    
    this.constraint.setAngularUpperLimit(new Ammo.btVector3(this.angularUpperLimit.x, 
                                                            this.angularUpperLimit.y, 
                                                            this.angularUpperLimit.z));

    Ammo.destroy(frameA);
    Ammo.destroy(quatA);
    Ammo.destroy(pivotA);

    var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;
    dynamicsWorld.addConstraint(this.constraint, !this.enableCollision);

    this.entity.rigidbody.activate();
};


// spectator.js
var Spectator = pc.createScript('spectator');

Spectator.attributes.add('player', {
    type: 'entity',
    description: 'Player entity'
});

// initialize code called once per entity
Spectator.prototype.initialize = function() {
    
};

// update code called every frame
Spectator.prototype.update = function(dt) {
    var pos = this.entity.getPosition(),
        playerPos = this.player.getPosition();
    
    this.entity.setPosition(playerPos.x, pos.y, playerPos.z);
};



// collision-shake.js
var CollisionShake = pc.createScript('collisionShake');

CollisionShake.attributes.add('power', {
    type: 'number',
    description: 'The power'
});

CollisionShake.attributes.add('rebound', {
    type: 'number',
    description: 'The power'
});

CollisionShake.attributes.add('player', {
    type: 'entity',
    description: 'The player'
});

CollisionShake.attributes.add('hud', {
    type: 'entity',
    description: 'Debug screen'
});

// initialize code called once per entity
CollisionShake.prototype.initialize = function() {
    this.dbg = this.hud.findByName('dbg').element;
    this.dbg2 = this.hud.findByName('dbg2').element;
    this.dbg3 = this.hud.findByName('dbg3').element;
    
    this.lastEul = new pc.Vec3(0, 0, 0);
    this.reboundFactor = new pc.Vec3(1, 1, 1);
    this.angVel = new pc.Vec3();
    this.framesToStop = 100;
    
    this.torqueV = new pc.Vec3(0, 0, 0);
    this.distToStop = new pc.Vec3(0, 0, 0);
    this.brakeV = new pc.Vec3(1, 1, 1);
    
    var onCollision = function (e) {
            if (e.other.name != 'Car')
                return;

            this.reboundFactor.set(1, 1, 1);
            this.entity.rigidbody.applyTorqueImpulse(e.contacts[0].normal.clone().scale(-this.power));
        }.bind(this);
    
    this.player.rigidbody.on('collisionstart', onCollision);
    
    this.on('destroy', function () {
        this.player.rigidbody.off('collisionstart', onCollision);
    }.bind(this));
};

CollisionShake.prototype.accelerate = function (torqueV) {
    torqueV.mul(this.getRebound());
    this.entity.rigidbody.applyTorque(torqueV);
    //this.dbg3.text = "accel";
};

CollisionShake.prototype.getRebound = function () {
    var reboundV = this.reboundFactor.clone().scale(this.rebound);
    return reboundV;
};

CollisionShake.prototype.getBrakeV = function (dt) {
    var eul = this.entity.getLocalEulerAngles(),
        vel = this.entity.rigidbody.angularVelocity.clone(),
        aDamp = Math.pow(1 - this.entity.rigidbody.angularDamping, dt),
        distToStop = this.distToStop,
        brakeV = this.brakeV;
    
    distToStop.set(0, 0, 0);
    brakeV.set(0, 0, 0);
    
    for (var i = 1; i <= this.framesToStop; i++) {
        vel.scale(1.1 * tr.Utils.RAD_TO_DEG * Math.pow(aDamp, i) * dt);
        distToStop.add(vel);
    }
    
    //lower
    ['x', 'y', 'z'].forEach(function(key) {
        brakeV[key] = Math.abs(eul[key]) <= Math.abs(distToStop[key]) ? 0 : 1;
    });
    
    //this.dbg3.text = brakeV ? "brake" : "";
    
    return brakeV;
};

CollisionShake.prototype.update = function(dt) {
    var torqueV = this.torqueV,
        eul = this.entity.getLocalEulerAngles(),
        playerPosZ = this.player.getPosition().z;
    
    torqueV.set(0, 0, 0);
    
    if (Math.abs(playerPosZ) >= tr.Config.ROAD_BORDER - 0.01) {
        if (!this.collision) {
            this.reboundFactor.set(1, 1, 1);

            var direction = playerPosZ > 0 ? 1 : -1;
            this.entity.rigidbody.applyTorqueImpulse(this.power, 0, this.power * direction);
        }
        
        this.collision = true;
    } else {
        this.collision = false;
    }
    
    // this.dbg.text = this.collision;
    
    ['x', 'y', 'z'].forEach(function(key) {
        torqueV[key] = eul[key] < 0 ? 1 : -1;

        if (this.lastEul[key] * eul[key] < 0)
            this.reboundFactor[key] /= 4;
    }.bind(this));

    torqueV.mul(this.getBrakeV(dt));
    this.accelerate(torqueV);
    
    this.lastEul.copy(eul);
    
    //this.dbg.text = eulX;
    //this.dbg2.text = -this.BREAKING_DIST * Math.abs(vel.x);
};

// pendulum.js
var Pendulum = pc.createScript('pendulum');

Pendulum.attributes.add('camera', {
    type: 'entity',
    description: 'Assign a camera entity'
});

Pendulum.attributes.add('configAngle', {
    type: 'string',
    enum: [
        { 'TILT_A': 'tiltAngle' },
        { 'HANDLEBAR_A': 'handlebarAngle' }
    ]
});

Pendulum.attributes.add('configPower', {
    type: 'string',
    enum: [
        { 'TILT_S': 'tiltSpeed' },
        { 'HANDLEBAR_S': 'handlebarSpeed' }
    ]
});

Pendulum.attributes.add('controller', {
    type: 'string',
    enum: [
        { 'BOT': 'BOT' },
        { 'PLAYER': 'PLAYER' }
    ]
});

Pendulum.attributes.add('hud', {
    type: 'entity',
    description: 'Debug screen'
});

// initialize code called once per entity
Pendulum.prototype.initialize = function() {
    this.dbg = this.hud.findByName('dbg').element;
    this.dbg2 = this.hud.findByName('dbg2').element;
    this.dbg3 = this.hud.findByName('dbg3').element;
    
    this.acceleration = tr.Storage.acceleration;
    
    this.framesToStop = 100; //Math.ceil(Math.log(0.0001) / Math.log(this.entity.rigidbody.angularDamping));
    
    var onCrashReset = function () {
            var eul = this.entity.getLocalEulerAngles();
            eul.x = tr.Storage.selectedBikeSpecs[this.configAngle] / 4 * tr.Utils.getRandomValue([-1, 1]);
            this.entity.rigidbody.teleport(this.entity.getPosition(), eul);
        }.bind(this),
        
        onEnable = function () {
            this.entity.rigidbody.angularVelocity = pc.Vec3.ZERO;
            this.entity.rigidbody.teleport(this.entity.getPosition(), pc.Vec3.ZERO);
        }.bind(this);
    
    this.on('enable', onEnable);
    this.app.on(tr.Events.CRASH_RESET, onCrashReset);
    
    this.on('destroy', function () {
        this.app.off(tr.Events.CRASH_RESET, onCrashReset);
    }.bind(this));
};

Pendulum.prototype.accelerate = function (x) {
    this.entity.rigidbody.applyTorque(x * this.getPower(), 0, 0);
};

Pendulum.prototype.stopAt = function (targetEulX) {
    var vel = this.entity.rigidbody.angularVelocity.clone(),
        pos = this.entity.getPosition();
    
    vel.x = 0;
    this.entity.rigidbody.angularVelocity = vel;
    this.entity.rigidbody.teleport(pos.x, pos.y, pos.z, targetEulX, 0, 0);
};

Pendulum.prototype.getPower = function () {
    var hSpeedRatio = tr.Storage.selectedBikeSpecs.handlingSpeedIncrease - 1;
    
    return tr.Storage.selectedBikeSpecs[this.configPower] * 
        (hSpeedRatio * 0.0133 * this.acceleration.velocity - hSpeedRatio * 0.0133 * tr.Config.MIN_SPEED + 1);
};

Pendulum.prototype.isBrakeTime = function (targetEulX, dt) {
    var eulX = this.entity.getLocalEulerAngles().x,
        velX = this.entity.rigidbody.angularVelocity.x,
        dEX = velX * tr.Utils.RAD_TO_DEG * dt,
        aDamp = Math.pow(1 - this.entity.rigidbody.angularDamping, dt),
        distToStop = 0,
        isBrakeTime = false;
    
    for (var i = 1; i <= this.framesToStop; i++) {
        distToStop += velX * 1.1 * tr.Utils.RAD_TO_DEG * Math.pow(aDamp, i) * dt;
    }
    
    if ((targetEulX > 0 && eulX >= targetEulX - distToStop) || 
        (targetEulX < 0 && eulX <= targetEulX - distToStop) ||
        (!targetEulX && Math.abs(eulX) <= Math.abs(distToStop)))
        isBrakeTime = true;
    
    if (velX &&
        ((targetEulX > 0 && eulX + dEX >= targetEulX) ||
         (targetEulX < 0 && eulX + dEX <= targetEulX) ||
         (!targetEulX && Math.abs(dEX) >= Math.abs(eulX))))
        this.stopAt(targetEulX);
    
    //this.dbg3.text = isBrakeTime ? "brake" : "";
    
    return isBrakeTime;
};

Pendulum.prototype.update = function(dt) {
    var maxAngle = tr.Storage.selectedBikeSpecs[this.configAngle],
        right = this.camera.right,
        x = 0,
        app = this.app,
        eulX = this.entity.getLocalEulerAngles().x;
    
    //this.dbg3.text = "";
    
    if ((this.controller == 'BOT' && tr.BotTouch.left) || 
        (this.controller == 'PLAYER' && (app.keyboard.isPressed(pc.KEY_LEFT) || tr.Touch.left)))
        x -= right.z;

    if ((this.controller == 'BOT' && tr.BotTouch.right) || 
        (this.controller == 'PLAYER' && (app.keyboard.isPressed(pc.KEY_RIGHT) || tr.Touch.right)))
        x += right.z;
    
    if (x) {
        if (!this.isBrakeTime(maxAngle * x, dt))
            this.accelerate(x);
    } else {
        x = eulX < 0 ? 1 : -1;
        
        if (!this.isBrakeTime(0, dt))
            this.accelerate(x);
    }
    
    //this.dbg.text = eulX;
    //this.dbg2.text = -this.BREAKING_DIST * Math.abs(vel.x);
};

// crash-controller.js
var CrashController = pc.createScript('crashController');

CrashController.attributes.add('player', {
    type: 'entity',
    description: 'The player'
});

CrashController.attributes.add('bikeModel', {
    type: 'entity',
    description: 'The Bike model with hands'
});

CrashController.attributes.add('bot', {
    type: 'entity',
    description: 'The bot'
});

CrashController.attributes.add('camera', {
    type: 'entity'
});

CrashController.attributes.add('crashCamera', {
    type: 'entity'
});

CrashController.attributes.add('crashEffect', {
    type: 'entity'
});

CrashController.attributes.add('crashFactor', {
    type: 'number',
    default: 1.5
});

// initialize code called once per entity
CrashController.prototype.initialize = function() {
    this.CRASH_DURATION = 4;
    this.acceleration = tr.Storage.acceleration;
    
    var onEnable = function () {
            this.revive = 0;
            this.resetCrash();
        }.bind(this),
    
        onDisable = function () {
            clearTimeout(this.resetTimeout);
        }.bind(this),
        
        onCollision = function (e) {
            var normal = this.raycastResult && this.raycastResult.entity == e.other ? 
                    this.raycastResult.normal : e.contacts[0].normal,
                other = this.raycastResult && this.raycastResult.entity == e.other ? 
                    this.raycastResult.entity : e.other;
            
            if (!this.acceleration.velocity)
                return;
            
            if ((Math.abs(this.player.script.player.dZ) * this.acceleration.velocity < this.crashFactor &&
                (Math.abs(normal.x) < 0.5 || (tr.Config.CRASH_VELOCITY > this.acceleration.velocity && 
                 (!other.dynamics || (other.dynamics.linearVelocity.x + this.acceleration.velocity) > 0)))) || 
                !tr.Config.PARAMETERS.CRASH || tr.Storage.gameState != tr.Keys.GAME_STATES.ACTIVE || other.name == 'Bot') {
                
                if (!this.acceleration.doCollisionBrake(normal, other))
                    this.doCrash();
                
                return;
            }

            this.doCrash();
        }.bind(this),
        
        onExplosion = function (e) {
            this.doCrash();
        }.bind(this);
    
    this.player.rigidbody.on('collisionstart', onCollision);
    
    this.app.on(tr.Events.BOMB_EXPLOSION, onExplosion);
    this.app.on(tr.Events.CRASH_RESET, this.resetCrash, this);
    
    this.on('enable', onEnable);
    this.on('disable', onDisable);
    
    this.on('destroy', function () {
        this.player.rigidbody.off('collisionstart', onCollision);
    }.bind(this));
    
    onEnable();
};

CrashController.prototype.resetCrash = function () {
    this.crashCamera.enabled = false;
    this.crashEffect.enabled = false;
    this.camera.enabled = true;
    this.bikeModel.enabled = true;
    this.acceleration.run();
};

CrashController.prototype.doCrash = function() {
    this.app.fire(tr.Events.CRASH_START);

    this.crashCamera.enabled = true;
    this.crashCamera.camera.horizontalFov = this.camera.camera.horizontalFov;
    this.crashCamera.camera.fov = this.camera.camera.fov;
    this.crashCamera.rigidbody.teleport(this.camera.getPosition().clone(), this.camera.getEulerAngles().clone());
    this.crashCamera.rigidbody.linearVelocity = new pc.Vec3(this.acceleration.velocity, 
                                                            this.acceleration.velocity / 10, 
                                                            this.player.script.player.dZ * 20);

    this.crashEffect.enabled = true;
    this.camera.enabled = false;
    this.bikeModel.enabled = false;
    this.acceleration.stop();

    this.resetTimeout = setTimeout(function () {
            if (tr.Storage.gameMode == tr.Keys.GAME_MODES.RACE) {
                if (this.revive < 2 && Apicontroller.hasRewardedVideo()) {
                    this.revive++;
                    this.app.fire(tr.Events.GAME_REVIVE);
                } else {
                    tr.Storage.gameState = tr.Keys.GAME_STATES.FAILED;

                    this.app.fire(tr.Events.GAME_OVER);
                }
                
                return;
            }

            this.app.fire(tr.Events.CRASH_RESET);
        }.bind(this), this.CRASH_DURATION * 1000);
};

CrashController.prototype.update = function(dt) {
    var handlebarPos = this.player.script.player.handlebar.getPosition(),
        start = new pc.Vec3(this.camera.camera.nearClip + handlebarPos.x, handlebarPos.y, handlebarPos.z),
        end = new pc.Vec3(this.camera.camera.farClip + handlebarPos.x, handlebarPos.y, handlebarPos.z);

    this.raycastResult = pc.app.systems.rigidbody.raycastFirst(start, end);
};

// terrain.js
var Terrain = pc.createScript('terrain');

Terrain.attributes.add('heightMap', {
    type: 'asset',
    assetType: 'texture'
});

Terrain.attributes.add('minHeight', {
    type: 'number',
    default: 0
});

Terrain.attributes.add('maxHeight', {
    type: 'number',
    default: 10
});

Terrain.attributes.add('width', {
    type: 'number',
    default: 100
});

Terrain.attributes.add('depth', {
    type: 'number',
    default: 100
});

Terrain.attributes.add('subdivisions', {
    type: 'number',
    default: 250
});

Terrain.attributes.add('material', {
    type: 'asset',
    assetType: 'material'
});

Terrain.prototype.initialize = function() {
    this.heightMap.ready(function (asset) {
        var img = this.heightMap.resource.getSource(),
            renderModel = this.createTerrainFromHeightMap(img, this.subdivisions),
            groundModel = this.entity.findByName('Ground_model_l');

        if (!groundModel.model)
            groundModel.addComponent('model');
        
        groundModel.model.model = renderModel;
    }.bind(this));
};

Terrain.prototype.createTerrainVertexData = function (options) {
    var positions = [];
    var uvs = [];
    var indices = [];
    var row, col;

    for (row = 0; row <= options.subdivisions; row++) {
        for (col = 0; col <= options.subdivisions; col++) {
            var position = new pc.Vec3((col * options.width) / options.subdivisions - (options.width / 2.0), 0, ((options.subdivisions - row) * options.height) / options.subdivisions - (options.height / 2.0));

            var heightMapX = (((position.x + options.width / 2) / options.width) * (options.bufferWidth - 1)) | 0;
            var heightMapY = ((1.0 - (position.z + options.height / 2) / options.height) * (options.bufferHeight - 1)) | 0;

            var pos = (heightMapX + heightMapY * options.bufferWidth) * 4;
            var r = options.buffer[pos] / 255.0;
            var g = options.buffer[pos + 1] / 255.0;
            var b = options.buffer[pos + 2] / 255.0;

            var gradient = r * 0.3 + g * 0.59 + b * 0.11;

            position.y = options.minHeight + (options.maxHeight - options.minHeight) * gradient;

            positions.push(position.x, position.y, position.z);
            uvs.push(col / options.subdivisions, 1.0 - row / options.subdivisions);
        }
    }

    for (row = 0; row < options.subdivisions; row++) {
        for (col = 0; col < options.subdivisions; col++) {
            indices.push(col + row * (options.subdivisions + 1));
            indices.push(col + 1 + row * (options.subdivisions + 1));
            indices.push(col + 1 + (row + 1) * (options.subdivisions + 1));

            indices.push(col + row * (options.subdivisions + 1));
            indices.push(col + 1 + (row + 1) * (options.subdivisions + 1));
            indices.push(col + (row + 1) * (options.subdivisions + 1));
        }
    }

    var normals = pc.calculateNormals(positions, indices);

    return {
        indices: indices,
        positions: positions,
        normals: normals,
        uvs: uvs
    };
};

Terrain.prototype.createTerrainFromHeightMap = function (img, subdivisions) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var bufferWidth = img.width;
    var bufferHeight = img.height;
    canvas.width = bufferWidth;
    canvas.height = bufferHeight;

    context.drawImage(img, 0, 0);

    var buffer = context.getImageData(0, 0, bufferWidth, bufferHeight).data;
    var vertexData = this.createTerrainVertexData({
        width: this.width,
        height: this.depth,
        subdivisions: subdivisions,
        minHeight: this.minHeight,
        maxHeight: this.maxHeight,
        buffer: buffer,
        bufferWidth: bufferWidth,
        bufferHeight: bufferHeight
    });

    var node = new pc.GraphNode();
    var material = this.material.resource;

    var mesh = pc.createMesh(this.app.graphicsDevice, vertexData.positions, {
        normals: vertexData.normals,
        uvs: vertexData.uvs,
        indices: vertexData.indices
    });

    var meshInstance = new pc.MeshInstance(node, mesh, material);

    var model = new pc.Model();
    model.graph = node;
    model.meshInstances.push(meshInstance);

    return model;
};

// ghost.js
var Ghost = pc.createScript('ghost');

Ghost.attributes.add('event', {
    type: 'string',
    enum: [
        { 'CRASH_RESET': 'crash:reset' },
        { 'CRASH_BOT': 'crash:bot' }
    ]
});

// initialize code called once per entity
Ghost.prototype.initialize = function() {
    this.BLINK_NUM = 7;
    this.BLINK_TIMEOUT = 150;
    
    var startBlink = function () {
            this.blink = true;
            this.entity.rigidbody.enabled = false;
        }.bind(this),
        
        onEnabled = function () {
            this.blinkingModel = tr.Storage.selectedBikeEntity;
            this.reset();
        }.bind(this);
    
    this.app.on(this.event, startBlink);
    this.on('enable', onEnabled);
    
    this.on('destroy', function () {
        this.app.off(this.event, startBlink);
    }.bind(this));
    
    onEnabled();
};

// update code called every frame
Ghost.prototype.reset = function() {
    this.blink = false;
    this.blinkingModel.enabled = true;
    this.entity.rigidbody.enabled = true;
    this.blinkCount = 0;
    this.blinktime = 0;
};

// update code called every frame
Ghost.prototype.update = function(dt) {
    if (!this.blink)
        return;
    
    this.blinktime += dt * 1000;
    
    if (this.blinktime >= this.BLINK_TIMEOUT) {
        this.blinkingModel.enabled = !this.blinkingModel.enabled;
        this.blinktime = 0;
        this.blinkCount++;
        
        if (this.blinkCount == this.BLINK_NUM * 2)
            this.reset();
    }
};

// bubble.js
var Bubble = pc.createScript('bubble');

// initialize code called once per entity
Bubble.prototype.initialize = function() {
    
};

// update code called every frame
Bubble.prototype.update = function(dt) {
    var pos = this.entity.getLocalPosition();
    pos.y += 1;
    
    this.entity.setLocalPosition(pos);
    this.entity.element.opacity -= 0.01;
    
    if (this.entity.element.opacity <= 0) {
        this.enabled = false;
        this.entity.destroy();
    }
};

// booster.js
var Booster = pc.createScript('booster');

Booster.attributes.add('showEvent', {
    type: 'string',
    enum: [
        { 'PLAYER_HIGH_SPEED': 'PLAYER_HIGH_SPEED' },
        { 'PLAYER_OPPOSING_LANE': 'PLAYER_OPPOSING_LANE' }
    ]
});

Booster.attributes.add('storageKey', {
    type: 'string',
    enum: [
        { 'HIGH_SPEED': 'hSpeed' },
        { 'OPPOSING_LANE': 'oppDist' }
    ]
});

// initialize code called once per entity
Booster.prototype.initialize = function() {
    var pos = this.entity.getLocalPosition(),
        toggle = function (e) {
            if (e)
                this.show();
            else
                this.hide();
        }.bind(this);
    
    this.HIDDEN_X = -270;
    this.SHOWN_X = pos.x;
    this.time = 0;
    this.timeText = this.entity.findByName('val').element;
    
    pos.x = this.HIDDEN_X;
    this.entity.setLocalPosition(pos);
    this.entity.enabled = false;
    
    this.app.on(tr.Events[this.showEvent], toggle);
    
    this.app.on(tr.Events.SCREEN_LOAD, this.hide, this);
    this.on('disable', this.hide, this);
    
    this.on('destroy', function () {
        this.app.off(tr.Events[this.showEvent], toggle);
    }.bind(this));
};

Booster.prototype.show = function() {
    this.entity.enabled = true;
    this.isShown = true;
    this.time = 0;
};

Booster.prototype.hide = function() {
    this.isShown = false;
};

// update code called every frame
Booster.prototype.update = function(dt) {  
    var pos = this.entity.getLocalPosition(),
        step = dt * 1000;
    
    if (this.isShown && pos.x < this.SHOWN_X)
        pos.x += step;
    else if (!this.isShown && pos.x > this.HIDDEN_X)
        pos.x -= step;
    
    if (this.isShown) {
        this.time += dt;
        tr.Storage[this.storageKey] += dt;
        this.timeText.text = this.time.toFixed(1) + 's';
    }
    
    pos.x = tr.Utils.bound2(pos.x, this.HIDDEN_X, this.SHOWN_X);
    
    this.entity.setLocalPosition(pos);
    
    if (!this.isShown && pos.x <= this.HIDDEN_X)
        this.entity.enabled = false;
};

// combo.js
var Combo = pc.createScript('combo');

// initialize code called once per entity
Combo.prototype.initialize = function() {
    var pos = this.entity.getLocalPosition(),
        val = this.entity.findByName('val').element,
        
        onOvertake = function (car, combo) {
            if ((tr.Storage.mission.xCombo && tr.Storage.mission.xCombo == combo) || 
                     (tr.Storage.mission.overtakes && tr.Storage.mission.overtakes == tr.Storage.overtakes)) {
                
                tr.Storage.gameState = tr.Keys.GAME_STATES.PASSED;

                this.app.fire(tr.Events.GAME_OVER);
            }
            
            if (combo > 1) {
                this.show();
                val.text = 'x' + combo;
                this.timeSinceCombo = 0;
            } else {
                this.hide();
            }
        }.bind(this);
    
    this.progress = this.entity.findByName('progress');
    this.progressW = this.progress.element.width;
    this.HIDDEN_X = -270;
    this.SHOWN_X = pos.x;
    this.timeSinceCombo = 0;
    
    pos.x = this.HIDDEN_X;
    this.entity.setLocalPosition(pos);
    this.entity.enabled = false;
    
    this.app.on(tr.Events.PLAYER_OVERTAKE, onOvertake);
    
    this.app.on(tr.Events.SCREEN_LOAD, this.hide, this);
    this.on('disable', this.hide, this);
    
    this.on('destroy', function () {
        this.app.off(tr.Events.PLAYER_OVERTAKE, onOvertake);
    }.bind(this));
};

Combo.prototype.show = function() {
    this.entity.enabled = true;
    this.isShown = true;
};

Combo.prototype.hide = function() {
    this.isShown = false;
};

// update code called every frame
Combo.prototype.update = function(dt) {
    var pos = this.entity.getLocalPosition(),
        step = dt * 1000;
    
    this.timeSinceCombo += dt;
    
    this.progress.element.width = this.progressW * (1 - (this.timeSinceCombo / tr.Config.COMBO_INT));
    
    if (this.isShown && pos.x < this.SHOWN_X)
        pos.x += step;
    else if (!this.isShown && pos.x > this.HIDDEN_X)
        pos.x -= step;
    
    pos.x = tr.Utils.bound2(pos.x, this.HIDDEN_X, this.SHOWN_X);
    
    this.entity.setLocalPosition(pos);
    
    if (!this.isShown && pos.x <= this.HIDDEN_X)
        this.entity.enabled = false;
    
    if (this.timeSinceCombo > tr.Config.COMBO_INT)
        this.hide();
};

// screen-controller.js
var ScreenController = pc.createScript('screenController');

ScreenController.attributes.add('loaderHud', {type: 'entity'});
ScreenController.attributes.add('loaderText', {type: 'entity'});
ScreenController.attributes.add('mask', {type: 'entity'});
ScreenController.attributes.add('bg', {type: 'entity'});
ScreenController.attributes.add('bike', {type: 'entity'});

// initialize code called once per entity
ScreenController.prototype.initialize = function() {
    this.BIKE_OFFSET = 5;
    
    this.screens = [new tr.GameScreen(),
                    new tr.Screen(tr.Keys.SCREENS.GARAGE),
                    new tr.Splitscreen(),
                    new tr.Showup(),
                    new tr.GasStation(),
                    new tr.Screen(tr.Keys.SCREENS.GO)];
    
    this.currentScreen = null;
    
    var urlParams = new URLSearchParams(window.location.search),
        screenParam = urlParams.get('screen');
    
    if(skipTitleScreen()) {
        this.loadScreen(screenParam ? screenParam : tr.Keys.SCREENS.GARAGE);
    } else {
        this.loadScreen(screenParam ? screenParam : tr.Keys.SCREENS.GAS_STATION); // tr.Keys.SCREENS.GO);
    }
    
    this.app.on(tr.Events.SCREEN_LOAD, function (screenName, data) {
        this.loadScreen(screenName, data);
    }.bind(this));
};

ScreenController.prototype.loadScreen = function(screenName, data) {
    var onCurrentScreenHidden = function () {
        this.loaderHud.enabled = true;
        this.mask.element.width = 0;
        this.bike.setLocalPosition(-this.BIKE_OFFSET, 0, 0);

        this.loadAssets(screenName.toLowerCase(), function () {
            this.loaderHud.enabled = false;

            this.currentScreen = this.screens.find(function (screen) {
                return screen.name == screenName;
            });

            this.currentScreen.show(data);
            
            if(screenName === tr.Keys.SCREENS.GARAGE) {
                this.app.fire(tr.Events.GARAGE_SCREEN_LOADED);
            }
            
        }.bind(this));
    }.bind(this);
    
    if (this.currentScreen)
        this.currentScreen.hide().then(onCurrentScreenHidden);
    else
        onCurrentScreenHidden();
};

ScreenController.prototype.loadAssets = function(tag, loadCallback) {
    var self = this,
        query = [tag],
        assetsLoaded = 0,
        assets,
        assestTotal,
        
        // Callback function when an asset is loaded
        onAssetReady = function() {
            assetsLoaded += 1;        

            // Update the progress bar
            self.setLoadingBarProgress(assetsLoaded / assestTotal);        

            // Once we have loaded all the assets
            if (assetsLoaded === assestTotal) {
                loadCallback();
            }        
        };
    
    if (tag == 'game') {
        query = ['game', tr.Storage.gameArea, 'bike_' + tr.Storage.selectedBike];
        
        if (tr.Storage.gameMode == tr.Keys.GAME_MODES.RACE)
            query.push(tr.Storage.mission.boss, 'boss_fight');
            query.push('bike_' + BotBike.getBotBikeModelNumber() + '_parts');
        
    } else if (tag == 'showup') {
        query.push('bike_' + tr.Storage.selectedBike + '_parts');
    }
    
    assets = this.app.assets.findByTag.apply(this.app.assets, query);
    assestTotal = assets.length;
    
    // Start loading all the assets
    for(var i = 0; i < assets.length; i++) {
        assets[i].ready(onAssetReady);
        this.app.assets.load(assets[i]);
    }
    
    if (!assets.length) {
        loadCallback();
    }    
};

ScreenController.prototype.setLoadingBarProgress = function(progress) {
    var width = this.bg.element.width * progress;
    
    this.loaderText.element.text = Math.round(progress * 100) + '%';
    this.mask.element.width = width;
    this.bike.setLocalPosition(width - this.BIKE_OFFSET, 0, 0);
};



// touch-input-garage.js
var TouchInputCamera = pc.createScript('touchInputCamera');

TouchInputCamera.attributes.add('orbitSensitivity', {
    type: 'number', 
    default: 0.4, 
    title: 'Orbit Sensitivity', 
    description: 'How fast the camera moves around the orbit. Higher is faster'
});

TouchInputCamera.attributes.add('distanceSensitivity', {
    type: 'number', 
    default: 0.2, 
    title: 'Distance Sensitivity', 
    description: 'How fast the camera moves in and out. Higher is faster'
});

TouchInputCamera.attributes.add('multitouchPan', {
    type: 'boolean',
    default: false,
    title: 'Pan',
    description: 'Pan with two fingers'
});

// initialize code called once per entity
TouchInputCamera.prototype.initialize = function() {
    this.orbitCamera = this.entity.script.orbitCamera;
    
    // Store the position of the touch so we can calculate the distance moved
    this.lastTouchPoint = new pc.Vec2();
    this.lastPinchMidPoint = new pc.Vec2();
    this.lastPinchDistance = 0;
    
    if (this.orbitCamera && this.app.touch) {
        // Use the same callback for the touchStart, touchEnd and touchCancel events as they 
        // all do the same thing which is to deal the possible multiple touches to the screen
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
        this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);
        
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        
        this.on('destroy', function() {
            this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
            this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
            this.app.touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);

            this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        });
    }
};


TouchInputCamera.prototype.getPinchDistance = function (pointA, pointB) {
    // Return the distance between the two points
    var dx = pointA.x - pointB.x;
    var dy = pointA.y - pointB.y;    
    
    return Math.sqrt((dx * dx) + (dy * dy));
};


TouchInputCamera.prototype.calcMidPoint = function (pointA, pointB, result) {
    result.set(pointB.x - pointA.x, pointB.y - pointA.y);
    result.scale(0.5);
    result.x += pointA.x;
    result.y += pointA.y;
};


TouchInputCamera.prototype.onTouchStartEndCancel = function(event) {
    // We only care about the first touch for camera rotation. As the user touches the screen, 
    // we stored the current touch position
    var touches = event.touches;
    if (touches.length == 1) {
        this.lastTouchPoint.set(touches[0].x, touches[0].y);
    
    } else if (this.multitouchPan && touches.length == 2) {
        // If there are 2 touches on the screen, then set the pinch distance
        this.lastPinchDistance = this.getPinchDistance(touches[0], touches[1]);
        this.calcMidPoint(touches[0], touches[1], this.lastPinchMidPoint);
    }
};


TouchInputCamera.fromWorldPoint = new pc.Vec3();
TouchInputCamera.toWorldPoint = new pc.Vec3();
TouchInputCamera.worldDiff = new pc.Vec3();


TouchInputCamera.prototype.pan = function(midPoint) {
    var fromWorldPoint = TouchInputCamera.fromWorldPoint;
    var toWorldPoint = TouchInputCamera.toWorldPoint;
    var worldDiff = TouchInputCamera.worldDiff;
    
    // For panning to work at any zoom level, we use screen point to world projection
    // to work out how far we need to pan the pivotEntity in world space 
    var camera = this.entity.camera;
    var distance = this.orbitCamera.distance;
    
    camera.screenToWorld(midPoint.x, midPoint.y, distance, fromWorldPoint);
    camera.screenToWorld(this.lastPinchMidPoint.x, this.lastPinchMidPoint.y, distance, toWorldPoint);
    
    worldDiff.sub2(toWorldPoint, fromWorldPoint);
     
    this.orbitCamera.pivotPoint.add(worldDiff);    
};


TouchInputCamera.pinchMidPoint = new pc.Vec2();

TouchInputCamera.prototype.onTouchMove = function(event) {
    var pinchMidPoint = TouchInputCamera.pinchMidPoint;
    
    // We only care about the first touch for camera rotation. Work out the difference moved since the last event
    // and use that to update the camera target position 
    var touches = event.touches;
    if (touches.length == 1) {
        var touch = touches[0];
        
        this.orbitCamera.pitch -= (touch.y - this.lastTouchPoint.y) * this.orbitSensitivity;
        this.orbitCamera.yaw -= (touch.x - this.lastTouchPoint.x) * this.orbitSensitivity;
        
        this.lastTouchPoint.set(touch.x, touch.y);
    
    } else if (this.multitouchPan && touches.length == 2) {
        // Calculate the difference in pinch distance since the last event
        var currentPinchDistance = this.getPinchDistance(touches[0], touches[1]);
        var diffInPinchDistance = currentPinchDistance - this.lastPinchDistance;
        this.lastPinchDistance = currentPinchDistance;
                
        this.orbitCamera.distance -= (diffInPinchDistance * this.distanceSensitivity * 0.1) * (this.orbitCamera.distance * 0.1);
        
        // Calculate pan difference
        this.calcMidPoint(touches[0], touches[1], pinchMidPoint);
        this.pan(pinchMidPoint);
        this.lastPinchMidPoint.copy(pinchMidPoint);
    }
};


// orbit-camera.js
var OrbitCamera = pc.createScript('orbitCamera');

OrbitCamera.attributes.add('distanceMax', {type: 'number', default: 0, title: 'Distance Max', 
                                           description: 'Setting this at 0 will give an infinite distance limit'});
OrbitCamera.attributes.add('distanceMin', {type: 'number', default: 0, title: 'Distance Min'});
OrbitCamera.attributes.add('pitchAngleMax', {type: 'number', default: 90, title: 'Pitch Angle Max (degrees)'});
OrbitCamera.attributes.add('pitchAngleMin', {type: 'number', default: -90, title: 'Pitch Angle Min (degrees)'});

OrbitCamera.attributes.add('inertiaFactor', {
    type: 'number',
    default: 0,
    title: 'Inertia Factor',
    description: 'Higher value means that the camera will continue moving after the user has stopped dragging.' + 
        '0 is fully responsive.'
});

OrbitCamera.attributes.add('focusEntity', {
    type: 'entity',
    title: 'Focus Entity',
    description: 'Entity for the camera to focus on. If blank, then the camera will use the whole scene'
});

OrbitCamera.attributes.add('halfExtents', {
    type: 'vec3',
    title: 'Half extents',
    default: [0, 0, 0]
});

OrbitCamera.attributes.add('frameOnStart', {
    type: 'boolean',
    default: true,
    title: 'Frame on Start',
    description: 'Frames the entity or scene at the start of the application."'
});

OrbitCamera.attributes.add('animation', {
    type: 'boolean',
    default: false,
    title: 'Auto orbit camera',
});


// Property to get and set the distance between the pivot point and camera
// Clamped between this.distanceMin and this.distanceMax
Object.defineProperty(OrbitCamera.prototype, "distance", {
    get: function() {
        return this._targetDistance;
    },

    set: function(value) {
        this._targetDistance = this._clampDistance(value);
    }
});


// Property to get and set the pitch of the camera around the pivot point (degrees)
// Clamped between this.pitchAngleMin and this.pitchAngleMax
// When set at 0, the camera angle is flat, looking along the horizon
Object.defineProperty(OrbitCamera.prototype, "pitch", {
    get: function() {
        return this._targetPitch;
    },

    set: function(value) {
        this._targetPitch = this._clampPitchAngle(value);
    }
});


// Property to get and set the yaw of the camera around the pivot point (degrees)
Object.defineProperty(OrbitCamera.prototype, "yaw", {
    get: function() {
        return this._targetYaw;
    },

    set: function(value) {
        this._targetYaw = value;
        this._animation = false;
        
        // Ensure that the yaw takes the shortest route by making sure that 
        // the difference between the targetYaw and the actual is 180 degrees
        // in either direction
        // var diff = this._targetYaw - this._yaw;
        // var reminder = diff % 360;
        // if (reminder > 180) {
        //     this._targetYaw = this._yaw - (360 - reminder);
        // } else if (reminder < -180) {
        //     this._targetYaw = this._yaw + (360 + reminder);
        // } else {
        //     this._targetYaw = this._yaw + reminder;
        // }
    }
});


// Property to get and set the world position of the pivot point that the camera orbits around
Object.defineProperty(OrbitCamera.prototype, "pivotPoint", {
    get: function() {
        return this._pivotPoint;
    },

    set: function(value) {
        this._pivotPoint.copy(value);
    }
});


OrbitCamera.prototype.postInitialize = function () {
    var self = this;
    var onWindowResize = function () {
        self._checkAspectRatio();
    };

    this._NORMAL_ANIMATION_SPEED = 0.1;
    this._START_ANIMATION_SPEED = 30;
    
    this._animation = this.animation;
    this._animationSpeed = this._START_ANIMATION_SPEED;
    
    window.addEventListener('resize', onWindowResize, false);

    this._checkAspectRatio();

    // Find all the models in the scene that are under the focused entity
    this._modelsAabb = new pc.BoundingBox(this.focusEntity.getPosition(), this.halfExtents);
    this._buildAabb(this.focusEntity || this.app.root, 0);

    this.entity.lookAt(this._modelsAabb.center);

    this._pivotPoint = new pc.Vec3();
    this._pivotPoint.copy(this._modelsAabb.center);

    // Calculate the camera euler angle rotation around x and y axes
    // This allows us to place the camera at a particular rotation to begin with in the scene
    var cameraQuat = this.entity.getRotation(),
        cameraPoint = this.entity.getPosition().clone();

    // Preset the camera
    this._yaw = this._calcYaw(cameraQuat);
    this._pitch = this._clampPitchAngle(this._calcPitch(cameraQuat, this._yaw));
    this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);

    this._distance = 0;

    this._targetYaw = this._yaw;
    this._targetPitch = this._pitch;

    // If we have ticked focus on start, then attempt to position the camera where it frames
    // the focused entity and move the pivot point to entity's position otherwise, set the distance
    // to be between the camera position in the scene and the pivot point
    if (this.frameOnStart) {
        this.focus(this.focusEntity || this.app.root);
    } else {
        var distanceBetween = new pc.Vec3();
        distanceBetween.sub2(this.entity.getPosition(), this._pivotPoint);
        this._distance = this._clampDistance(distanceBetween.length());
    }

    this._targetDistance = this._distance;

    // Reapply the clamps if they are changed in the editor
    this.on('attr:distanceMin', function (value, prev) {
        this._targetDistance = this._clampDistance(this._distance);
    });

    this.on('attr:distanceMax', function (value, prev) {
        this._targetDistance = this._clampDistance(this._distance);
    });

    this.on('attr:pitchAngleMin', function (value, prev) {
        this._targetPitch = this._clampPitchAngle(this._pitch);
    });

    this.on('attr:pitchAngleMax', function (value, prev) {
        this._targetPitch = this._clampPitchAngle(this._pitch);
    });

    // Focus on the entity if we change the focus entity
    this.on('attr:focusEntity', function (value, prev) {
        if (this.frameOnStart) {
            this.focus(value || this.app.root);
        } else {
            this.resetAndLookAtEntity(this.entity.getPosition(), value || this.app.root);
        }
    });

    this.on('attr:frameOnStart', function (value, prev) {
        if (value) {
            this.focus(this.focusEntity || this.app.root);
        }
    });

    this.on('enable', function() {
        self.resetAndLookAtPoint(cameraPoint.clone(), self._modelsAabb.center);
        self._animation = true;
        self._animationSpeed = self._START_ANIMATION_SPEED;
    });
    
    this.on('destroy', function() {
        window.removeEventListener('resize', onWindowResize, false);
    });
};


// Moves the camera to look at an entity and all its children so they are all in the view
OrbitCamera.prototype.focus = function (focusEntity) {
    // Calculate an bounding box that encompasses all the models to frame in the camera view
    this._buildAabb(focusEntity, 0);

    var halfExtents = this._modelsAabb.halfExtents;

    var distance = Math.max(halfExtents.x, Math.max(halfExtents.y, halfExtents.z));
    distance = (distance / Math.tan(0.5 * this.entity.camera.fov * pc.math.DEG_TO_RAD));
    distance = (distance * 2);

    this.distance = distance;

    this._removeInertia();

    this._pivotPoint.copy(this._modelsAabb.center);
};


OrbitCamera.distanceBetween = new pc.Vec3();

// Set the camera position to a world position and look at a world position
// Useful if you have multiple viewing angles to swap between in a scene
OrbitCamera.prototype.resetAndLookAtPoint = function (resetPoint, lookAtPoint) {
    this.pivotPoint.copy(lookAtPoint);
    this.entity.setPosition(resetPoint);

    this.entity.lookAt(lookAtPoint);

    var distance = OrbitCamera.distanceBetween;
    distance.sub2(lookAtPoint, resetPoint);
    this.distance = distance.length();

    this.pivotPoint.copy(lookAtPoint);

    var cameraQuat = this.entity.getRotation();
    this.yaw = this._calcYaw(cameraQuat);
    this.pitch = this._calcPitch(cameraQuat, this.yaw);

    this._removeInertia();
    this._updatePosition();
};


// Set camera position to a world position and look at an entity in the scene
// Useful if you have multiple models to swap between in a scene
OrbitCamera.prototype.resetAndLookAtEntity = function (resetPoint, entity) {
    this._buildAabb(entity, 0);
    this.resetAndLookAtPoint(resetPoint, this._modelsAabb.center);
};


// Set the camera at a specific, yaw, pitch and distance without inertia (instant cut)
OrbitCamera.prototype.reset = function (yaw, pitch, distance) {
    this.pitch = pitch;
    this.yaw = yaw;
    this.distance = distance;

    this._removeInertia();
};


OrbitCamera.prototype.update = function(dt) {
    if (this._animation)
        this._targetYaw -= this._animationSpeed;
    
    if (this._animationSpeed > this._NORMAL_ANIMATION_SPEED)
        this._animationSpeed = this._NORMAL_ANIMATION_SPEED;
    
    // Add inertia, if any
    var t = this.inertiaFactor === 0 ? 1 : Math.min(dt / this.inertiaFactor, 1);
    this._distance = pc.math.lerp(this._distance, this._targetDistance, t);
    this._yaw = pc.math.lerp(this._yaw, this._targetYaw, t);
    this._pitch = pc.math.lerp(this._pitch, this._targetPitch, t);

    this._updatePosition();
};


OrbitCamera.prototype._updatePosition = function () {
    // Work out the camera position based on the pivot point, pitch, yaw and distance
    this.entity.setLocalPosition(0,0,0);
    this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);

    var position = this.entity.getPosition();
    position.copy(this.entity.forward);
    position.scale(-this._distance);
    position.add(this.pivotPoint);
    this.entity.setPosition(position);
};


OrbitCamera.prototype._removeInertia = function () {
    this._yaw = this._targetYaw;
    this._pitch = this._targetPitch;
    this._distance = this._targetDistance;
};


OrbitCamera.prototype._checkAspectRatio = function () {
    var height = this.app.graphicsDevice.height;
    var width = this.app.graphicsDevice.width;

    // Match the axis of FOV to match the aspect ratio of the canvas so
    // the focused entities is always in frame
    this.entity.camera.horizontalFov = height > width;
};


OrbitCamera.prototype._buildAabb = function (entity, modelsAdded) {
    var i = 0;

    if (entity.model && entity.model.meshInstances) {
        var mi = entity.model.meshInstances;
        for (i = 0; i < mi.length; i++) {
            if (modelsAdded === 0) {
                this._modelsAabb.copy(mi[i].aabb);
            } else {
                this._modelsAabb.add(mi[i].aabb);
            }

            modelsAdded += 1;
        }
    }

    for (i = 0; i < entity.children.length; ++i) {
        modelsAdded += this._buildAabb(entity.children[i], modelsAdded);
    }

    return modelsAdded;
};


OrbitCamera.prototype._calcYaw = function (quat) {
    var transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);

    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
};


OrbitCamera.prototype._clampDistance = function (distance) {
    if (this.distanceMax > 0) {
        return pc.math.clamp(distance, this.distanceMin, this.distanceMax);
    } else {
        return Math.max(distance, this.distanceMin);
    }
};


OrbitCamera.prototype._clampPitchAngle = function (pitch) {
    // Negative due as the pitch is inversed since the camera is orbiting the entity
    return pc.math.clamp(pitch, -this.pitchAngleMax, -this.pitchAngleMin);
};


OrbitCamera.quatWithoutYaw = new pc.Quat();
OrbitCamera.yawOffset = new pc.Quat();

OrbitCamera.prototype._calcPitch = function(quat, yaw) {
    var quatWithoutYaw = OrbitCamera.quatWithoutYaw;
    var yawOffset = OrbitCamera.yawOffset;

    yawOffset.setFromEulerAngles(0, -yaw, 0);
    quatWithoutYaw.mul2(yawOffset, quat);

    var transformedForward = new pc.Vec3();

    quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);

    return Math.atan2(transformedForward.y, -transformedForward.z) * pc.math.RAD_TO_DEG;
};

// mouse-input-camera.js
var MouseInputCamera = pc.createScript('mouseInputCamera');

MouseInputCamera.attributes.add('orbitSensitivity', {
    type: 'number', 
    default: 0.3, 
    title: 'Orbit Sensitivity', 
    description: 'How fast the camera moves around the orbit. Higher is faster'
});

MouseInputCamera.attributes.add('distanceSensitivity', {
    type: 'number', 
    default: 0.15, 
    title: 'Distance Sensitivity', 
    description: 'How fast the camera moves in and out. Higher is faster'
});

MouseInputCamera.attributes.add('panEnabled', {
    type: 'boolean',
    default: false,
    title: 'Pan',
    description: 'Pan with middle or right button'
});

// initialize code called once per entity
MouseInputCamera.prototype.initialize = function() {
    this.orbitCamera = this.entity.script.orbitCamera;
        
    if (this.orbitCamera) {
        var self = this;
        
        var onMouseOut = function (e) {
           self.onMouseOut(e);
        };
        
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

        // Listen to when the mouse travels out of the window
        window.addEventListener('mouseout', onMouseOut, false);
        
        // Remove the listeners so if this entity is destroyed
        this.on('destroy', function() {
            this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
            this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
            this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
            this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

            window.removeEventListener('mouseout', onMouseOut, false);
        });
    }
    
    // Disabling the context menu stops the browser displaying a menu when
    // you right-click the page
    this.app.mouse.disableContextMenu();
  
    this.lookButtonDown = false;
    this.panButtonDown = false;
    this.lastPoint = new pc.Vec2();
};


MouseInputCamera.fromWorldPoint = new pc.Vec3();
MouseInputCamera.toWorldPoint = new pc.Vec3();
MouseInputCamera.worldDiff = new pc.Vec3();


MouseInputCamera.prototype.pan = function(screenPoint) {
    var fromWorldPoint = MouseInputCamera.fromWorldPoint;
    var toWorldPoint = MouseInputCamera.toWorldPoint;
    var worldDiff = MouseInputCamera.worldDiff;
    
    // For panning to work at any zoom level, we use screen point to world projection
    // to work out how far we need to pan the pivotEntity in world space 
    var camera = this.entity.camera;
    var distance = this.orbitCamera.distance;
    
    camera.screenToWorld(screenPoint.x, screenPoint.y, distance, fromWorldPoint);
    camera.screenToWorld(this.lastPoint.x, this.lastPoint.y, distance, toWorldPoint);

    worldDiff.sub2(toWorldPoint, fromWorldPoint);
       
    this.orbitCamera.pivotPoint.add(worldDiff);    
};


MouseInputCamera.prototype.onMouseDown = function (event) {
    switch (event.button) {
        case pc.MOUSEBUTTON_LEFT: {
            this.lookButtonDown = true;
        } break;
            
        case pc.MOUSEBUTTON_MIDDLE: 
        case pc.MOUSEBUTTON_RIGHT: {
            this.panButtonDown = this.panEnabled;
        } break;
    }
};


MouseInputCamera.prototype.onMouseUp = function (event) {
    switch (event.button) {
        case pc.MOUSEBUTTON_LEFT: {
            this.lookButtonDown = false;
        } break;
            
        case pc.MOUSEBUTTON_MIDDLE: 
        case pc.MOUSEBUTTON_RIGHT: {
            this.panButtonDown = false;            
        } break;
    }
};


MouseInputCamera.prototype.onMouseMove = function (event) {    
    var mouse = pc.app.mouse;
    if (this.lookButtonDown) {
        this.orbitCamera.pitch -= event.dy * this.orbitSensitivity;
        this.orbitCamera.yaw -= event.dx * this.orbitSensitivity;
        
    } else if (this.panButtonDown) {
        this.pan(event);   
    }
    
    this.lastPoint.set(event.x, event.y);
};


MouseInputCamera.prototype.onMouseWheel = function (event) {
    this.orbitCamera.distance -= event.wheel * this.distanceSensitivity * (this.orbitCamera.distance * 0.1);
    event.event.preventDefault();
};


MouseInputCamera.prototype.onMouseOut = function (event) {
    this.lookButtonDown = false;
    this.panButtonDown = false;
};

// garage-controller.js
/* jshint esversion: 6 */
var GarageController = pc.createScript('garageController');

GarageController.attributes.add("playButton", {type: "entity", title: "Play button"});
GarageController.attributes.add("backButton", {type: "entity"});
GarageController.attributes.add("prevBikeBtn", {type: "entity"});
GarageController.attributes.add("nextBikeBtn", {type: "entity"});
GarageController.attributes.add("settingsBtn", {type: "entity"});
GarageController.attributes.add("settingsWindow", {type: "entity"});
GarageController.attributes.add("bikeInfo", {type: "entity"});
GarageController.attributes.add("map", {type: "entity"});
GarageController.attributes.add("cash", {type: "entity"});
GarageController.attributes.add("cashBg", {type: "entity"});
GarageController.attributes.add("fullscreen", {type: "entity"});
GarageController.attributes.add("bikeLoadingSpinner", {type: "entity"});
GarageController.attributes.add("brandingImage", {type: "entity"});

// initialize code called once per entity
GarageController.prototype.initialize = function() {
    var pages = this.entity.findByTag('pages'),
        currentPage = 0,
        
        nextPage = function () {
            if (currentPage)
                pages[currentPage - 1].enabled = false;
            
            pages[currentPage].enabled = true;
            this.backButton.enabled = true;
            this.playButton.enabled = false;
            this.prevBikeBtn.enabled = false;
            this.nextBikeBtn.enabled = false;
            this.bikeInfo.enabled = false;
            
            currentPage++;
        }.bind(this),
        
        prevPage = function () {
            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            
            if (currentPage)
                pages[currentPage - 1].enabled = false;
            
            if (pages[currentPage - 2]) {
                pages[currentPage - 2].enabled = true;
            } else {
                showBikeUI();
            }
            
            currentPage--;
        }.bind(this),
        
        showMap = function () {
            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            tr.Storage.mapRequest = false;
            
            if (currentPage)
                pages[currentPage - 1].enabled = false;
            
            this.map.enabled = true;
            this.backButton.enabled = true;
            this.playButton.enabled = false;
            this.prevBikeBtn.enabled = false;
            this.nextBikeBtn.enabled = false;
            this.bikeInfo.enabled = false;
            
            currentPage++;
        }.bind(this),
        
        onEnable = function () {
            var color = new pc.Color();
            color.fromString('#D3D1DC');
            this.app.scene.ambientLight = color;
            
            this.bikeLoadingSpinner.enabled = false;
            
            currentPage = 0;
            
            setCash(tr.Storage.totalCash);
            showBikeUI();
            
            pages.forEach(function (page, index) {
                page.enabled = false;
            });
            
            tr.SoundController.play(tr.Keys.SOUNDS.OPEN_GARAGE);
            
            this.app.fire(tr.Events.GARAGE_ENTER);            
            
            if (tr.Storage.mapRequest || skipTitleScreen())
                showMap();
        }.bind(this),
        
        onDisable = function () {
            
        }.bind(this),
    
        showBikeUI = function () {
            this.nextBikeBtn.enabled = true;
            this.prevBikeBtn.enabled = true;
            this.bikeInfo.enabled = true;
            this.backButton.enabled = false;
            this.map.enabled = false;
            
            onBikeUpdate();
        }.bind(this),
        
        toggleFullscreen = function () {
            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            
            var elem = document.querySelector("body");

            if (!document.fullscreenElement) {
                elem.requestFullscreen().catch(function (err) {
                    console.log('Error attempting to enable full-screen mode: ' + err.message + ' ' + err.name);
                });
            } else {
                document.exitFullscreen();
            }
        }.bind(this),
    
        setCash = function (cash) {
            this.cash.element.text = cash;
            this.cashBg.element.width = 120 + 27 * cash.toString().length;
        }.bind(this),
        
        onBikeUpdate = function () {
            var bikeUnlocked = tr.Storage.unlockedBikes[tr.Storage.selectedBike - 1],
                bikeOwned = tr.Storage.ownBikes[tr.Storage.selectedBike - 1];
            
            setCash(tr.Storage.totalCash);
            
            this.playButton.enabled = bikeUnlocked && bikeOwned;
        }.bind(this),
        
        showSettings = function () {
            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            this.settingsWindow.enabled = true;
        }.bind(this);
    
    tr.MusicController.enabled = tr.Storage.sound.music;
    tr.SoundController.enabled = tr.Storage.sound.sfx;
    
    this.settingsBtn.element.on('click', showSettings);
    this.fullscreen.element.on('click', toggleFullscreen);
    //this.playButton.element.on('click', nextPage);
    this.playButton.element.on('click', function () {
        setTimeout(showMap, 30);
    });
    this.backButton.element.on('click', prevPage);
    
    this.app.on(tr.Events.GARAGE_NEXT_PAGE, nextPage);
    this.app.on(tr.Events.GARAGE_MAP, showMap);
    this.app.on(tr.Events.BIKE_UPDATE, onBikeUpdate);
        
    this.app.on(tr.Events.BIKE_LOADING_STARTED, () => this.bikeLoadingSpinner.enabled = true);
    this.app.on(tr.Events.BIKE_LOADING_FINISHED,  () => this.bikeLoadingSpinner.enabled = false);
    
    this.on('enable', onEnable);
    this.on('disable', onDisable);
    
    this.on('destroy', function () {
        this.playButton.element.off('click', nextPage);
        this.backButton.element.off('click', prevPage);
    }.bind(this));
    
    onEnable();
};


GarageController.prototype.update = function() {
    if(isExternalMute()) {
        this.settingsBtn.enabled = false;
    }
};

// game-over-screen.js
var GameOverScreen = pc.createScript('gameOverScreen');

GameOverScreen.attributes.add('winLoose', {type: 'entity'});
GameOverScreen.attributes.add('firework', {type: 'entity'});

GameOverScreen.attributes.add('distVal', {type: 'entity'});
GameOverScreen.attributes.add('overtVal', {type: 'entity'});
GameOverScreen.attributes.add('hSpeedVal', {type: 'entity'});
GameOverScreen.attributes.add('maxComboVal', {type: 'entity'});
GameOverScreen.attributes.add('remainingVal', {type: 'entity'});
GameOverScreen.attributes.add('x2Val', {type: 'entity'});
GameOverScreen.attributes.add('wrenchesVal', {type: 'entity'});

GameOverScreen.attributes.add('totalCashVal', {type: 'entity'});

GameOverScreen.attributes.add('wrenchGroup', {type: 'entity'});
GameOverScreen.attributes.add('claimGroup', {type: 'entity'});
GameOverScreen.attributes.add('x2Group', {type: 'entity'});
GameOverScreen.attributes.add('continueGroup', {type: 'entity'});
GameOverScreen.attributes.add('homeBtn', {type: 'entity'});
GameOverScreen.attributes.add('restartBtn', {type: 'entity'});
GameOverScreen.attributes.add('claimBtn', {type: 'entity'});
GameOverScreen.attributes.add('x2Btn', {type: 'entity'});

// initialize code called once per entity
GameOverScreen.prototype.initialize = function() {
    var onEnable = function () {
            var missionPassed = tr.Storage.gameState == tr.Keys.GAME_STATES.PASSED,
                level = tr.Storage.level,
                distCash,
                overtCash,
                hSpeedCash,
                oppositeCash,
                missionCash;

            this.claimGroup.enabled = false;
            this.x2Group.enabled = false;
        
            var showButtons = (delay) => {
                console.log('Displaying buttons...');
                setTimeout(() => {
                    this.claimGroup.enabled = true;
                    
                    if(Apicontroller.hasRewardedVideo()) {
                        // this.claimGroup.enabled = true;
                        this.x2Group.enabled = true;
                    } else {
                        //clearClaimGroup();
                        this.x2Group.enabled = false;
                    }
                    
                }, delay * 1000);
            };
           
        
            setTimeout(() => {
                
                if (missionPassed) {
                    /* success */
                    Promise.all([
                            window.famobi_analytics.trackEvent(
                                "EVENT_LEVELSUCCESS",
                                {
                                    levelName: '' +  level
                                }
                            ),
                            window.famobi_analytics.trackEvent(
                                "EVENT_LEVELSCORE",
                                {
                                    levelName: '' +  level,
                                    levelScore: Math.floor(tr.Storage.distance || 0)
                                }
                            ),
                            window.famobi.showInterstitialAd()
                    ]).then(() => showButtons(0.5), () => showButtons(0.5));

                } else {
                    /* defeat */
                    Promise.all([
                        window.famobi_analytics.trackEvent(
                            "EVENT_LEVELFAIL",
                            {
                                levelName: '' + level,
                                reason: 'dead'
                            }
                        ),
                        window.famobi_analytics.trackEvent(
                            "EVENT_LEVELSCORE",
                            {
                                levelName: '' +  level,
                                levelScore: Math.floor(tr.Storage.distance || 0)
                            }
                        ),
                        window.famobi.showInterstitialAd()
                    ]).then(() => showButtons(0.5), () => showButtons(0.5));
                }
                
            }, 500);
        
            
        
            // this.scores.element.text = tr.Storage.getVisibleScores();
        
            distCash = Math.round(tr.Storage.distance * 0.0375);
            overtCash = tr.Storage.overtakes * 5;
            hSpeedCash = Math.round(tr.Storage.hSpeed * 2.5);
            oppositeCash = Math.round(tr.Storage.oppDist * 4.25);
            missionCash = missionPassed ? tr.Storage.missionController.getReward(tr.Storage.mission) : 0;
            
            this.totalCash = distCash + overtCash + hSpeedCash + oppositeCash + missionCash;
            
            //this.distCash.element.text = distCash;
            //this.overtCash.element.text = overtCash;
            //this.hSpeedCash.element.text = hSpeedCash;
            //this.oppositeCash.element.text = oppositeCash;
            //this.missionCash.element.text = missionCash;
            
            this.firework.enabled = missionPassed;
            this.winLoose.element.texture = missionPassed ? this.winTexture.resource : this.looseTexture.resource;
        
            this.distVal.script.animateNumber.set(tr.Storage.getVisibleDistance(), true);
            this.overtVal.script.animateNumber.set(tr.Storage.overtakes, true);
            this.maxComboVal.script.animateNumber.set(tr.Storage.maxCombo, true);
            this.hSpeedVal.script.animateNumber.set(tr.Storage.hSpeed.toFixed(1), true);
            this.remainingVal.script.animateNumber.set(tr.Storage.getVisibleTime(), true);
            this.wrenchesVal.script.animateNumber.set(tr.Storage.coins, true);
            this.totalCashVal.script.animateNumber.set(this.totalCash, true);
            this.x2Val.script.animateNumber.set(this.totalCash * 2, true);
            
            addTotalCash(this.totalCash);
        
            if (missionPassed && tr.Storage.missionController.isFirstPass(tr.Storage.mission)) {
                tr.Storage.currentMission++;
                tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.CMISSION, tr.Storage.currentMission);
            }
        
            this.wrenchGroup.enabled = tr.Storage.gameMode == tr.Keys.GAME_MODES.RACE;
            this.continueGroup.enabled = false;
            // this.claimGroup.enabled = true;
            // this.x2Group.enabled = true;
        }.bind(this),
        
        onHomeClick = function () {
            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            
            if (tr.Storage.gameMode == tr.Keys.GAME_MODES.RACE && tr.Storage.gameState == tr.Keys.GAME_STATES.PASSED) {
                var bikeToUnlock = tr.Storage.mission.bossBike - 1;

                if (bikeToUnlock >= 0 && !tr.Storage.unlockedBikes[bikeToUnlock]) {
                    tr.Storage.unlockedBikes[bikeToUnlock]++;
                    
                    if (bikeToUnlock == 9)
                        tr.Storage.unlockedBikes[bikeToUnlock + 1]++;    
                    
                    tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.UBIKES, tr.Storage.unlockedBikes);

                    tr.Storage.selectedBike = bikeToUnlock + 1;
                    tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.SELECTED_BIKE, tr.Storage.selectedBike);

                    this.app.fire(tr.Events.BIKE_UPDATE);
                    this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.SHOWUP);
                    
                    return;
                }
            }
            
            this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GARAGE);
        }.bind(this),
        
        onRestartClick = function () {
            window.famobi_analytics.trackEvent("EVENT_LEVELRESTART", {levelName: '' + tr.Storage.level});
            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GAME, tr.Storage.mission);
        }.bind(this),
        
        
        addTotalCash = function (totalCash) {
            tr.Storage.totalCash += totalCash;
            tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.CASH, tr.Storage.totalCash);
        }.bind(this),
        
        
        clearClaimGroup = function () {
            this.continueGroup.enabled = true;
            this.claimGroup.enabled = false;
            this.x2Group.enabled = false;
            this.wrenchGroup.enabled = false;
            this.homeBtn.enabled = true;
            this.restartBtn.enabled = tr.Storage.gameState != tr.Keys.GAME_STATES.PASSED;
        }.bind(this),
        
        
        onX2Click = function () {
            if (this.showingAd)
                return;

            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            this.showingAd = true;

            if(Apicontroller.hasRewardedVideo()) {
                Apicontroller.showRewardedVideo((result) => {
                    if(result.rewardGranted) {
                        addTotalCash(this.totalCash);
                        clearClaimGroup();
                    }
                    this.showingAd = false;
                });
            }
        }.bind(this),
        
        
        onClaimClick = function () {
            setTimeout(() => {
                tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
                clearClaimGroup();
            }, 30);
        }.bind(this);
    
    this.winTexture = this.app.assets.find('WinScreen.png', 'texture');
    this.looseTexture = this.app.assets.find('LoseScreen.png', 'texture');
    
    this.homeBtn.element.on('click', onHomeClick);
    this.restartBtn.element.on('click', onRestartClick);
    this.x2Btn.element.on('click', onX2Click);
    this.claimBtn.element.on('click', onClaimClick);
    this.on("enable", onEnable);
    
    this.on('destroy', function () {
        this.off("enable", onEnable);
        this.homeBtn.element.off('click', onHomeClick);
        this.restartBtn.element.off('click', onRestartClick);
    }.bind(this));
    
    onEnable();
};

// controls.js
var Controls = pc.createScript('controls');

// initialize code called once per entity
Controls.prototype.initialize = function() {
    if (!this.app.touch)
        return;
    
    var controls = this.entity.findByTag('controls');
    
    controls.forEach(function (control, index) {
        control.enabled = true;
    });
};


// mode-selector.js
var ModeSelector = pc.createScript('modeSelector');

ModeSelector.attributes.add('gameMode', {
    type: 'string',
    enum: [
        { 'CAREER': 'career' },
        { 'ENDLESS': 'endless' },
        { 'TIME_TRIAL': 'timeTrial' },
        { 'OVERTAKE': 'overtake' },
        { 'RACE': 'race' }
    ]
});

// initialize code called once per entity
ModeSelector.prototype.initialize = function() {
    var selectMode = function () {
        tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
        
        tr.Storage.gameMode = this.gameMode;
        
        setTimeout(function () {
            this.app.fire(this.gameMode == tr.Keys.GAME_MODES.CAREER ? tr.Events.GARAGE_MAP : tr.Events.GARAGE_NEXT_PAGE);
        }.bind(this), 30);
        
    }.bind(this);
    
    this.entity.element.on('click', selectMode);
};

// tile.js
var Tile = pc.createScript('tile');

Tile.attributes.add('envObject', {
    type: 'entity',
    description: 'Env obj prefab'
});

Tile.attributes.add('road', {
    type: 'entity',
    description: 'The road'
});

Tile.attributes.add('crossroad', {
    type: 'entity',
    description: 'The crossroad'
});

Tile.attributes.add('checkpoint', {
    type: 'entity',
    description: 'The checkpoint'
});

// initialize code called once per entity
Tile.prototype.initialize = function() {
    this.objects = [];
    this.SIGN_X = 0;
    this.SIGN_Y = 8;
    this.SIGN_EUL = new pc.Vec3(180, -60, 180);
    this.SIGN_SCALE = 0.05;
    this.SIGNS = this.app.assets.findByTag('sign');
    
    this.fieldMaterial = this.app.assets.findByTag(['field', 'roadside']);
    this.grassMaterial = this.app.assets.findByTag(['floor-near', 'roadside']);
    this.grassFields = this.entity.findByTag('grass-field');
    
    this.checkpointAsset = this.app.assets.find('checkpoint line.glb', 'model');
    this.finishAsset = this.app.assets.find('finish line.glb', 'model');
};

Tile.prototype.getRandomSections = function(sectionsNum) {
    var sectionStack = tr.Utils.range(this.sectionsTotal),
        sections = [],
        ind;
    
    while (sections.length < sectionsNum) {
        ind = tr.Utils.getRandomIndex(sectionStack);
        sections.push(sectionStack[ind]);
        sectionStack.splice(ind, 1);
    }
    
    return sections;
};

Tile.prototype.getSectionCoords = function (section, biome) {
    var x = section % this.sectionsX - 1,
        y = Math.floor(section / this.sectionsX),
        rand = biome == tr.Keys.BIOMES.BIOME_A ? tr.Utils.getRandomInt(this.minOffset, this.maxOffset) : 0;
    
    return new pc.Vec2((x * this.sectionSize) + rand + this.aabb.x,
                       (y * this.sectionSize) + rand + this.aabb.y);
};

Tile.prototype.setObjects = function(side, biome) {
    var sections = this.getRandomSections(this.objCount),
        coords,
        envObj,
        asset,
        batchGroup,
        i;

    for (i = 0; i < this.objCount; i++) {
        coords = this.getSectionCoords(sections[i], biome);
        envObj = this.envObject.clone();
        this.objects.push(envObj);
        asset = tr.Utils.getRandomValue(this.app.assets.findByTag([biome, tr.Storage.gameArea], [[biome, 'game']]));
        envObj.model.asset = asset;
        
        if (asset.tags.has('windmill')) {
            envObj.addComponent("script");
            envObj.script.create("windmill", {
                attributes: {
                    angularVelocity: tr.Storage.gameArea == 'roadside' ? 15 : 30
                }
            });
        } else if (asset.tags.has('oil_pump')) {
            envObj.addComponent("script");
            envObj.script.create("oilPump");
        }
        
//      batchGroup = this.app.batcher.getGroupByName(asset.name);

//      if (!batchGroup)
//          batchGroup = this.app.batcher.addGroup(asset.name, true, 100);

//      envObj.model.batchGroupId = batchGroup.id;
//                 
        envObj.reparent(this.entity);

        envObj.setLocalPosition(coords.x, 0, coords.y * side);
        envObj.setLocalEulerAngles(0, tr.Utils.getRandomValue([0, 90, 180, 270]), 0);
        envObj.enabled = true;
    }
};

Tile.prototype.calcAabb = function (biome) {
    var sectionSize = 20,
        objCount,
        aabb;
    
    switch (tr.Storage.gameArea) {
        case tr.Keys.GAME_AREAS.HIGHWAY:
            switch (biome) {
                case tr.Keys.BIOMES.BIOME_A:
                    aabb = new pc.Vec4(-50, 10, 50, 90);
                    objCount = tr.Utils.getRandomInt(10, 18);
                break;
                    
                case tr.Keys.BIOMES.BIOME_B:
                case tr.Keys.BIOMES.CROSSROAD:
                    aabb = new pc.Vec4(-50, 20, 50, 80);
                    objCount = tr.Utils.getRandomInt(6, 8);
                break;
            }
            
        break;
        
        case tr.Keys.GAME_AREAS.ROADSIDE:
            switch (biome) {
                case tr.Keys.BIOMES.BIOME_A:
                    aabb = new pc.Vec4(-50, 10, 50, 90);
                    objCount = tr.Utils.getRandomInt(10, 18);
                break;
                    
                case tr.Keys.BIOMES.BIOME_B:
                    aabb = new pc.Vec4(-50, 20, 50, 80);
                    objCount = tr.Utils.getRandomInt(2, 5);
                break;
                    
                case tr.Keys.BIOMES.CROSSROAD:
                    aabb = new pc.Vec4(-50, 20, 50, 80);
                    objCount = tr.Utils.getRandomInt(6, 8);
                break;
            }
            
        break;
        
        case tr.Keys.GAME_AREAS.ROUTE66:
            switch (biome) {
                case tr.Keys.BIOMES.BIOME_A:
                    aabb = new pc.Vec4(-50, 15, 50, 90);
                    objCount = tr.Utils.getRandomInt(2, 5);
                    sectionSize = 25;
                break;
                    
                case tr.Keys.BIOMES.BIOME_B:
                case tr.Keys.BIOMES.CROSSROAD:
                    aabb = new pc.Vec4(-50, 20, 50, 80);
                    objCount = tr.Utils.getRandomInt(6, 8);
                break;
            }

        break;
    }
    
    this.aabb = aabb;
    this.objCount = objCount;
    this.sectionSize = sectionSize;
    
    this.minOffset = this.sectionSize * 0.1;
    this.maxOffset = this.sectionSize * 0.9;
};

Tile.prototype.reset = function (biome, checkpoint) {
    this.calcAabb(biome); 
    
    var tileLength = this.aabb.z - this.aabb.x,
        tileWidth = this.aabb.w - this.aabb.y,
        fieldMaterial = biome != tr.Keys.BIOMES.BIOME_B ? this.grassMaterial : this.fieldMaterial,
        sign;
    
    this.road.enabled = biome != tr.Keys.BIOMES.CROSSROAD;
    this.crossroad.enabled = biome == tr.Keys.BIOMES.CROSSROAD;
    
    this.sectionsTotal = tileLength * tileWidth / Math.pow(this.sectionSize, 2);
    this.sectionsX = tileLength / this.sectionSize;
    
    this.objects.forEach(function (obj, index) {
        obj.destroy();
        obj = null;
    });
    
    this.objects = [];
    
    if (biome != tr.Keys.BIOMES.CROSSROAD) {
        this.setObjects(1, biome);
        this.setObjects(-1, biome);
    }
    
    this.grassFields.forEach(function (field, index) {
        field.model.model.meshInstances[0].material = fieldMaterial[0].resource;
    });
    
    if (tr.Utils.throwDice(0.1)) {
        envObj = this.envObject.clone();
        this.objects.push(envObj);
        sign = tr.Utils.getRandomValue(this.SIGNS);
        envObj.model.asset = sign;
        this.entity.addChild(envObj);
        envObj.setLocalPosition(this.SIGN_X, 0, this.SIGN_Y);
        envObj.setLocalEulerAngles(this.SIGN_EUL);
        envObj.setLocalScale(this.SIGN_SCALE, this.SIGN_SCALE, this.SIGN_SCALE);
        envObj.enabled = true;
    }
    
    this.checkpoint.enabled = !!checkpoint;
    
    if (checkpoint)
        this.checkpoint.model.asset = checkpoint == 1 ? this.checkpointAsset : this.finishAsset;
};

// bikeSelector.js
var BikeSelector = pc.createScript('bikeSelector');

BikeSelector.NEXT = 'NEXT';
BikeSelector.PREVIOUS = 'PREVIOUS';

BikeSelector.attributes.add('direction', {
    type: 'string',
    enum: [
        { 'NEXT': BikeSelector.NEXT },
        { 'PREVIOUS': BikeSelector.PREVIOUS }
    ]
});

// initialize code called once per entity
BikeSelector.prototype.initialize = function() {
    var bikeNumber = this.app.assets.findByTag('bike_body').length,
        
        reset = function () {
            if ((this.direction == BikeSelector.PREVIOUS && tr.Storage.selectedBike == 1) ||
                (this.direction == BikeSelector.NEXT && tr.Storage.selectedBike == bikeNumber)) {
                
                this.entity.element.opacity = 0.25;
                this.active = false;
                
                return;
            }
            
            this.entity.element.opacity = 1;
            this.active = true;
        }.bind(this);
    
    this.entity.element.on('click', function () {
        if (!this.active)
            return;
        
        tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
        
        if (this.direction == BikeSelector.NEXT)
            tr.Storage.selectedBike++;
        else 
            tr.Storage.selectedBike--;
        
        tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.SELECTED_BIKE, tr.Storage.selectedBike);
        
        this.app.fire(tr.Events.BIKE_UPDATE);
    }.bind(this));
    
    this.on('enable', reset);
    this.app.on(tr.Events.BIKE_UPDATE, reset);
    
    reset();
};



// bike.js
var Bike = pc.createScript('bike');

Bike.attributes.add('handsEnabled', {
    type: 'boolean',
    default: false
});

Bike.attributes.add('flareEnabled', {
    type: 'boolean',
    default: true
});

Bike.attributes.add('headlightEnabled', {
    type: 'boolean',
    default: false
});

Bike.attributes.add('castShadows', {
    type: 'boolean',
    default: true
});

Bike.attributes.add('isStatic', {
    type: 'boolean',
    default: true
});

// initialize code called once per entity
Bike.prototype.initialize = function() {
    this.bikes = {};
    this.bikesLoading = {};
        
    var onEnable = function () {
            this.app.on(tr.Events.BIKE_UPDATE, updateModel);
            updateModel();
        }.bind(this),
        
        onDisable = function () {
            this.app.off(tr.Events.BIKE_UPDATE, updateModel);
        }.bind(this),
        
        updateModel = function () {
            var keys = Object.keys(this.bikes),
                bikeIndex = tr.Storage.selectedBike,
                bikeName = 'bike_' + tr.Storage.selectedBike,
                headlight,
                hbModel,
                bModel,
                blobs,
                hands,
                bikeTemplate;
            
            
            this.entity.children.forEach(child => child.enabled = false);

            if (this.bikes[bikeName]) {
                this.bikes[bikeName].enabled = true;
                return;
            }
            
            
            if(this.bikesLoading[bikeName] === undefined) {
                
                this.bikesLoading[bikeName] = true;   
                this.app.fire(tr.Events.BIKE_LOADING_STARTED);  
                
                AssetsLoader.getInstance().loadByTag(bikeName, bikeName + '_parts').then((assetsLoaded) => {
                
                    /* update loading status */
                    this.bikesLoading[bikeName] = false;  
                    
                    this.app.fire(tr.Events.BIKE_LOADING_FINISHED);
                    bikeTemplate = this.app.assets.find(bikeName, 'template');
                    const bike = bikeTemplate.resource.instantiate();

                    if(this.bikes[bikeName]) {
                        this.bikes[bikeName].destroy();
                    }
                    
                    this.bikes[bikeName] = bike;
                    
                    bike.enabled = true;
                    bike.reparent(this.entity);
                   

                    hands = bike.findByName('Hands');
                    hands.enabled = this.handsEnabled;

                    blobs = bike.findByName('BlobContainer');

                    if (blobs)
                        blobs.enabled = this.flareEnabled;

                    hbModel = bike.findByName('HBModel');
                    hbModel.model.castShadows = this.castShadows;
                    hbModel.model.isStatic = this.isStatic;

                    bModel = bike.findByName('BModel');
                    bModel.model.castShadows = this.castShadows;
                    bModel.model.isStatic = this.isStatic;

                    headlight = bike.findByName('Headlight');
                    headlight.enabled = this.headlightEnabled;

                    bike.enabled = bikeIndex === tr.Storage.selectedBike;
                    
                    var bikeScale = bike.getLocalScale().clone(),
                        scaleObj = new pc.Vec3();

                    bike.setLocalScale(scaleObj);

                    this.entity
                        .tween(scaleObj)
                        .to(bikeScale, 0.3, pc.ElasticOut)
                        .on('update', function () {
                            bike.setLocalScale(scaleObj);
                        }.bind(this))
                        .start();
                });
            }
            
            
                
        }.bind(this);
    
    this.on('enable', onEnable);
    this.on('disable', onDisable);
    
    onEnable();
};



// bot.js
var Bot = pc.createScript('bot');

Bot.attributes.add('bike', {
    type: 'entity',
    description: 'The bike'
});

Bot.attributes.add('handling', {
    type: 'entity',
    description: 'Handling physics entity'
});

Bot.attributes.add('hud', {
    type: 'entity',
    description: 'Debug screen'
});

Bot.attributes.add('player', {
    type: 'entity',
    description: 'The player'
});

Bot.attributes.add('minDist', {
    type: 'number',
    default: 35,
    description: 'Min distance to player'
});

Bot.attributes.add('maxDist', {
    type: 'number',
    default: 60,
    description: 'Max distance to player'
});

Bot.attributes.add('zSpeedSlope', {
    type: 'number',
    default: 0.015,
    description: 'Relevance between x and z speed'
});

Bot.attributes.add('headlight', {
    type: 'entity',
    description: 'Headlight'
});

Bot.attributes.add('taillight', {
    type: 'entity',
    description: 'Taillight'
});

// initialize code called once per entity
Bot.prototype.initialize = function() {
    this.HANDLING_INTERVAL = 400;
    this.BORDER_OFFSET = 1.5;
    this.currentHandlingInterval = this.HANDLING_INTERVAL;
    this.DAMPING = 0.1;
    this.VELOCITY_LOSS = 20;
    this.bodyPower = 6000;

    this.dbg = this.hud.findByName('dbg').element;
    this.dbg2 = this.hud.findByName('dbg2').element;
    
    this.botPosInit = this.entity.getPosition().clone();
    this.acceleration = tr.Storage.acceleration;
    
    this.on('enable', this.reset, this);
    this.on('disable', this.stop, this);
    
    this.reset();
};

Bot.prototype.reset = function () {
    this.bikeEulInit = this.bike.getLocalEulerAngles().clone();
    this.bikePosInit = this.bike.getLocalPosition().clone();
    
    this.handLocalEulers = new pc.Vec3();
    this.bikeLocalPos = new pc.Vec3();
    
    this.headlight.enabled = tr.Storage.nightMode;
    this.taillight.enabled = tr.Storage.nightMode;
    
    this.timeElapsed = 0;
    this.throwDistElapsed = 0;
    this.distToMaxDz = 0;
    this.lastDz = 0;
    this.dZ = 0;
    
    this.resetPosition();
    
    this.run();
    this.resetHandlingTimeout();
};

Bot.prototype.resetPosition = function () {
    this.entity.setPosition(this.botPosInit.x, this.botPosInit.y, this.botPosInit.z);
};

Bot.prototype.resetHandlingTimeout = function () {
    this.currentHandlingInterval = this.HANDLING_INTERVAL + Math.random() * 1000;
    this.timeElapsed = 0;
};

Bot.prototype.startHandling = function(direction) {
    this.resetHandlingTimeout();
    
    if (this.dodgeInProgress || !direction)
        return;
    
    this.handle(direction);
    this.handlingInProgress = true;
};

Bot.prototype.startDodge = function(direction) {
    if (!direction)
        return;
    
    this.handle(direction);
    this.dodgeInProgress = true;
};

Bot.prototype.handle = function(direction) {
    this.dZDistCounting = true;
    this.distToMaxDz = 0;
    
    tr.BotTouch.left = direction < 0;
    tr.BotTouch.right = direction > 0;
};

Bot.prototype.stopHandling = function() {
    this.handlingInProgress = false;
    this.dZDistCounting = false;
    
    tr.BotTouch.left = false;
    tr.BotTouch.right = false;
    
    this.resetHandlingTimeout();
};

Bot.prototype.stopDodge = function() {
    this.dodgeInProgress = false;
    
    tr.BotTouch.left = false;
    tr.BotTouch.right = false;
};

Bot.prototype.run = function() {
    this.velocity = tr.Config.MIN_SPEED;
};

Bot.prototype.stop = function() {
    this.velocity = 0;
};

Bot.prototype.getAccelLevel = function() {
    var botPos = this.entity.getPosition(),
        playerPos = this.player.getPosition();
    
    if (botPos.x - playerPos.x > this.maxDist * tr.Storage.mission.bossDistRatio)
        return 0.01;
    else if (botPos.x - playerPos.x > this.minDist * tr.Storage.mission.bossDistRatio)
        return 0.9;
    else
        return 2;
};

Bot.prototype.getMaxSpeed = function() {
    return tr.Storage.getMaxSpeed() * this.getAccelLevel();
};

Bot.prototype.getPower = function() {
    return tr.Storage.getPower() * this.getAccelLevel();
};

Bot.prototype.getLaneNumber = function() {
    var botPos = this.entity.getPosition(),
        laneHalfWidth = tr.Config.LANES_Z[1];
    
    for (i = 0; i < tr.Config.LANES_Z.length; i++) {
        if (tr.Utils.isInRange(tr.Config.LANES_Z[i] - laneHalfWidth, tr.Config.LANES_Z[i] + laneHalfWidth, botPos.z))
            return i;
    }
};

Bot.prototype.getDirectionByLaneNum = function(laneNum, raycastResults) {
    switch (laneNum) {
        case 0:
            if (!raycastResults[1] || !raycastResults[2])
                return -1;
            else
                return 0;
            break;
        case 1:
            if (!raycastResults[2])
                return -1;
            else if (!raycastResults[0])
                return 1;
            else
                return 0;
            break;
        case 2:
            if (!raycastResults[3] && !raycastResults[1]) 
                return tr.Utils.getRandomInt(0, 1) ? 1 : -1;
            else if (!raycastResults[3])
                return -1;
            else if (!raycastResults[1])
                return 1;
            else
                return 0;
            break;
        case 3:
            if (!raycastResults[2] || !raycastResults[1])
                return 1;
            else
                return 0;
            break;
    }
};

Bot.prototype.doRayCast = function (rayZ, rayOffset) {  
    var botPos = this.entity.getPosition(),
        rayStart = new pc.Vec3(botPos.x - rayOffset, botPos.y, rayZ),
        rayEnd = new pc.Vec3(this.acceleration.velocity * 1.5 + botPos.x, botPos.y, rayZ);

    return pc.app.systems.rigidbody.raycastFirst(rayStart, rayEnd);
};

// update code called every frame
Bot.prototype.update = function(dt) {
    if (!dt)
        return;
    
    var botPos = this.entity.getPosition(),
        handEul = this.handling.getLocalEulerAngles().x,
        speed = this.acceleration.velocity,
        laneNum = this.getLaneNumber(),
        raycastResults = [],
        rayOffset,
        rayStart,
        rayEnd,
        rayZ,
        i;
    
    if (this.prevLaneNum === undefined)
        this.prevLaneNum = laneNum; 
    
    for (i = 0; i < tr.Config.LANES_Z.length; i++) {
        rayZ = tr.Config.LANES_Z[i];
        rayOffset = i == laneNum ? 0 : 3;
        raycastResults[i] = this.doRayCast(rayZ, rayOffset);
        
        if (!raycastResults[i] && i < tr.Config.LANES_Z.length - 1)
            raycastResults[i] = this.doRayCast(rayZ - this.LANE_HALF_WIDTH);
    }
    
    this.handLocalEulers.x = -handEul;
    
                         //Math.pow(speed, 1 / 5)
    this.dZ = handEul * (this.zSpeedSlope * speed + 1.3) * this.app.timeScale * tr.Storage.selectedBikeSpecs.handling / 10000;
    
    if (this.dZDistCounting && 
        ((tr.BotTouch.right && this.dZ > this.lastDz) ||
        (tr.BotTouch.left && this.dZ < this.lastDz)))
        this.distToMaxDz += this.dZ;
    else
        this.dZDistCounting = false;
        
    this.lastDz = this.dZ;
    
    //this.heul = Math.max(this.heul || 0, handEul);
    //this.dbg.text = bodyPos.x; //this.heul;
    //this.dbg2.text = headEul;
    
    this.entity.setPosition(botPos.x, botPos.y, tr.Utils.bound(botPos.z + this.dZ, tr.Config.ROAD_BORDER - this.BORDER_OFFSET));
    
    this.bike.setLocalEulerAngles(handEul * 1.5 * 0.5, -handEul * 0.5, this.bikeEulInit.z);
    
    this.entity.translate((this.velocity - this.acceleration.velocity) * dt, 0, 0);
    
    this.timeElapsed += dt * 1000;
    this.throwDistElapsed += this.velocity * dt;
    
    if ((this.handlingInProgress || this.dodgeInProgress) && 
        ((botPos.z >= tr.Config.ROAD_BORDER - this.BORDER_OFFSET - this.distToMaxDz && tr.BotTouch.right) || 
        (botPos.z <= -tr.Config.ROAD_BORDER + this.BORDER_OFFSET - this.distToMaxDz && tr.BotTouch.left))) {
        this.stopHandling();
        this.stopDodge();
    }
    
    if (this.handlingInProgress &&
       (tr.BotTouch.right && laneNum && raycastResults[laneNum - 1]) || 
       (tr.BotTouch.left && laneNum < 3 && raycastResults[laneNum + 1])) {
        this.stopHandling();
        this.stopDodge();
    }
    
    if (raycastResults[laneNum] && !this.dodgeInProgress) {
        this.stopHandling();
        this.startDodge(this.getDirectionByLaneNum(laneNum, raycastResults));
    } else if ((this.timeElapsed >= this.currentHandlingInterval) && !this.dodgeInProgress) {
        if (!this.handlingInProgress)
            this.startHandling(this.getDirectionByLaneNum(laneNum, raycastResults));
        else
            this.stopHandling();
    }
    
    if (this.throwDistElapsed >= tr.Storage.mission.throwCooldown) {
        this.throwDistElapsed = 0;
        
        if (tr.Utils.throwDice(tr.Storage.mission.coinProb))
            this.app.fire(tr.Events.COIN_THROW, botPos);
        else
            this.app.fire(tr.Events.BOMB_THROW, botPos);
    }
    
    var x = -1,
        damping = 1,
        power;
    
    if (tr.Utils.msToKmh(this.velocity) < this.getMaxSpeed())
        x = 1;
    
    power = x > 0 ? this.getPower() : tr.Storage.getBreaking();
    
    damping = x < 0 ? 1 : (1 - this.velocity / tr.Utils.kmhToMs(this.getMaxSpeed()));
    this.velocity += x * power * dt * damping;
    
    if (this.dodgeInProgress && this.prevLaneNum != laneNum)
        this.stopDodge();
        
    this.prevLaneNum = laneNum;
};

// tempo-pin.js
var TempoPin = pc.createScript('tempoPin');

// initialize code called once per entity
TempoPin.prototype.initialize = function() {
    this.initRotations = [];
    
    var onEnable = function () {
            if (!this.entity.model.model) {
                this.enabled = false;
                return;
            }
        
            if (!this.initRotations[tr.Storage.selectedBike - 1])
                this.initRotations[tr.Storage.selectedBike - 1] = 
                    this.entity.model.model.graph.children[0].getLocalRotation().clone();
        
            this.entity.model.model.graph.children[0].setLocalRotation(this.initRotations[tr.Storage.selectedBike - 1]);
            
            this.START_ANGLE = tr.Storage.selectedBikeSpecs.tempoPinAngles;
            this.TOTAL_DEG = this.START_ANGLE * 2;
            this.MAX_SPEED = tr.Storage.getMaxSpeed();
            this.DEG_COST = this.TOTAL_DEG / this.MAX_SPEED;
            this.START_SPEED_ANGLE = this.DEG_COST * tr.Utils.msToKmh(tr.Config.MIN_SPEED);
            this.acceleration = tr.Storage.acceleration;
            this.entity.model.model.graph.children[0].rotateLocal(0, 0, this.START_ANGLE - this.START_SPEED_ANGLE);
            this.v1 = this.acceleration.velocity;
        }.bind(this);
    
    this.on('enable', onEnable);
    
    onEnable();
};

// update code called every frame
TempoPin.prototype.update = function(dt) {
    var dv = this.acceleration.velocity - this.v1,
        deltaAngle = tr.Utils.msToKmh(dv) * this.DEG_COST;
    
    this.v1 = this.acceleration.velocity;
    
    this.entity.model.model.graph.children[0].rotateLocal(0, 0, -deltaAngle);
};

// Sky.js
var Sky = pc.createScript('sky');

Sky.attributes.add('cloud', {
    type: 'entity',
    description: 'Cloud prefab'
});

// initialize code called once per entity
Sky.prototype.initialize = function() {
    this.CLOUD_NUMBER = 25;
    this.clouds = [];
    this.MIN_POINT = new pc.Vec3(230, 50, 300);
    this.MAX_POINT = new pc.Vec3(280, 230, -300);
    this.WIND_SPEED = 5;
    
    var onEnable = function () {
        var cloudAssets = this.app.assets.findByTag([tr.Storage.gameArea, 'cloud']),
            cloudAsset,
            cloudObj,
            x, y, z,
            i;

        this.clouds.forEach(function (obj, index) {
            obj.destroy();
            obj = null;
        });
        
        this.clouds = [];
        
        if (!cloudAssets.length)
            return;
        
        for (i = 0; i < this.CLOUD_NUMBER; i++) {
            cloudObj = this.cloud.clone();
            this.clouds.push(cloudObj);
            cloudAsset = tr.Utils.getRandomValue(cloudAssets);
            cloudObj.model.asset = cloudAsset;
            this.entity.addChild(cloudObj);

            x = tr.Utils.getRandomInt(this.MIN_POINT.x, this.MAX_POINT.x);
            y = Math.round((this.MAX_POINT.y - this.MIN_POINT.y) * 
                           (1 - (x - this.MIN_POINT.x) / (this.MAX_POINT.x - this.MIN_POINT.x))) + this.MIN_POINT.y;
            z = ((this.MAX_POINT.z - this.MIN_POINT.z) / (this.CLOUD_NUMBER - 1) * 
                            i) + this.MIN_POINT.z;  //tr.Utils.getRandomInt(this.MIN_POINT.z, this.MAX_POINT.z);

            cloudObj.setPosition(x, y, z);
            cloudObj.setEulerAngles(tr.Utils.getRandomInt(0, 360),
                                    tr.Utils.getRandomInt(0, 360),
                                    tr.Utils.getRandomInt(0, 360));
            cloudObj.enabled = true;

            //console.log(cloudObj.getPosition());
        }
    }.bind(this);
    
    this.on('enable', onEnable);
    
    onEnable();
};

// update code called every frame
Sky.prototype.update = function(dt) {
    var cloudPos,
        cloud,
        i;
    
    for (i = 0; i < this.clouds.length; i++) {
        cloud = this.clouds[i];
        cloudPos = cloud.getPosition();
        cloudPos.z -= dt * this.WIND_SPEED;
        
        if (cloudPos.z < this.MAX_POINT.z)
            cloudPos.z = this.MIN_POINT.z;
        
        cloud.setPosition(cloudPos);
    }
};

// mountains.js
var Mountains = pc.createScript('mountains');

Mountains.attributes.add('bike', {
    type: 'entity',
    description: 'Acceleration entity'
});

// initialize code called once per entity
Mountains.prototype.initialize = function() {
    this.MOUNTAIN_LEN = 500;
    
    this.mountainL = this.app.assets.find('MountainL', 'template');
    this.mountainR = this.app.assets.find('MountainR', 'template');
    
    var onEnable = function () {
            this.reset();
        }.bind(this);
    
    this.on('enable', onEnable);
    
    onEnable();
};

Mountains.prototype.reset = function () {
    if (this.mountainsL)
        this.mountainsL.list.forEach(function (obj, index) {
            obj.destroy();
            obj = null;
        });
    
    if (this.mountainsR)
        this.mountainsR.list.forEach(function (obj, index) {
            obj.destroy();
            obj = null;
        });
    
    this.mountainsL = new tr.Ridge(this.mountainL, 1);
    this.mountainsR = new tr.Ridge(this.mountainR, 0);

    this.acceleration = this.entity.script.acceleration;
    this.assets = this.app.assets.findByTag([tr.Storage.gameArea, 'mountain']);

    this.createMountains(this.mountainsL);
    this.createMountains(this.mountainsR);
};

Mountains.prototype.createMountains = function (ridge) {
    while (ridge.sumLength < this.MOUNTAIN_LEN) {
        this.createMountain(ridge);
    }
};

Mountains.prototype.createMountain = function (ridge) {
    var aabb,
        newMountain;
    
    newMountain = ridge.template.resource.instantiate();
    newMountain.model.asset = tr.Utils.getRandomValue(this.assets);
    aabb = tr.Utils.getAABB(newMountain);
    newMountain.mountainLength = aabb.halfExtents.x * 2;
    
    this.entity.addChild(newMountain);
    
    newMountain.enabled = true;
    newMountain.translate(ridge.sumLength + newMountain.mountainLength * !ridge.invertedPivot, 0, 0);
    
    ridge.push(newMountain);
};

Mountains.prototype.moveMountains = function(ridge, dt) {
    var bikePos = this.bike.getPosition(),
        firstMountain = ridge.list[0],
        fMountainPos = firstMountain.getPosition();

    ridge.list.forEach(function (mountain, index) {
        mountain.translate(-dt * this.acceleration.velocity, 0, 0);
    }.bind(this));

    if (bikePos.x > (fMountainPos.x + firstMountain.mountainLength * ridge.invertedPivot)) {
        firstMountain.translate(ridge.sumLength, 0, 0);

        ridge.shift();
        this.createMountain(ridge);
    }
};

// update code called every frame
Mountains.prototype.update = function(dt) {
    this.moveMountains(this.mountainsL, dt);
    this.moveMountains(this.mountainsR, dt);
};

// game-sound.js
var GameSound = pc.createScript('gameSound');

GameSound.attributes.add('handling', {
    type: 'entity',
    description: 'Handling physics entity'
});

// initialize code called once per entity
GameSound.prototype.initialize = function() {
    this.MAX_PITCH_DELTA = 0.05;
    this.ENGINE_VOLUME = 0.1;
    this.HANDLING_INFLUENCE = 0.45;
    this.acceleration = tr.Storage.acceleration;
    
    var sound = this.entity.sound,
        
        play = function () {
            if (this.onPause || !this.app.timeScale)
                return;
            
            this.MAX_SPEED = tr.Utils.kmhToMs(tr.Storage.getMaxSpeed());
            this.SHIFT_RATIOS = tr.Storage.selectedBikeSpecs.shiftRatios;
            this.PITCH_BAND = tr.Config.PITCH_BANDS[1]; //tr.Config.PITCH_BANDS[tr.Storage.selectedBike == 1 ? 0 : 1]
            
            stop();
            
            if (tr.Storage.sound.sfx) {
                this.soundInstance = sound.play(tr.Storage.selectedBikeSpecs.sound);
                if(this.soundInstance) this.soundInstance.volume = 0;
            }
            
            if (tr.Storage.sound.music && !sound.slot(tr.Keys.SOUNDS.GAME_MUSIC).resume())
                 sound.play(tr.Keys.SOUNDS.GAME_MUSIC);
            
        }.bind(this),
        
        stop = function () {
            if (this.soundInstance)
                this.soundInstance.stop();
            
            sound.pause(tr.Keys.SOUNDS.GAME_MUSIC);
        }.bind(this),
        
        onPause = function () {
            this.onPause = true;
            
            stop();
        }.bind(this),
        
        onResume = function () {
            this.onPause = false;
            
            play();
        }.bind(this),
        
        onEnable = function () {
            sound.stop(tr.Keys.SOUNDS.GAME_MUSIC);
            
            onResume();
        }.bind(this),
        
        onSoundSettings = function () {
            if (!this.enabled)
                return;
            
            stop();
            play();
        }.bind(this);
    
    this.on('enable', onEnable);
    this.on('disable', onPause);
    
    this.app.on(tr.Events.GAME_OVER, onPause);
    this.app.on(tr.Events.GAME_PAUSE, onPause);
    this.app.on(tr.Events.GAME_REVIVE, onPause);
    this.app.on(tr.Events.GAME_RESUME, onResume);
    this.app.on(tr.Events.SOUND_MUSIC, onSoundSettings);
    this.app.on(tr.Events.SOUND_SFX, onSoundSettings);
    
    play();
};

GameSound.prototype.getGear = function() {
    var ratio = this.acceleration.velocity / this.MAX_SPEED;
    
    return this.SHIFT_RATIOS.findIndex(function (val) {
            return ratio < val;
        }) - 1;
};

// update code called every frame
GameSound.prototype.update = function(dt) {
    if (this.onPause || !this.app.timeScale || !this.soundInstance)
        return;
    
    var gear = this.getGear(),
        pitchBand = !gear ? 0 : 1,
        minSpeed = this.SHIFT_RATIOS[gear] * this.MAX_SPEED,
        maxSpeed = this.SHIFT_RATIOS[gear + 1] * this.MAX_SPEED,
        handlingRatio = 1 - this.HANDLING_INFLUENCE * 
                        (Math.abs(this.handling.getLocalEulerAngles().x) / tr.Storage.selectedBikeSpecs.handlebarAngle),
        rpmRatio = (this.acceleration.velocity - minSpeed) / (maxSpeed - minSpeed) * handlingRatio,
        pitch = this.app.timeScale * rpmRatio * (this.PITCH_BAND[pitchBand].y - this.PITCH_BAND[pitchBand].x) + 
            this.PITCH_BAND[pitchBand].x;
    
    if (Math.abs(pitch - this.soundInstance.pitch) > this.MAX_PITCH_DELTA)
        this.soundInstance.pitch += this.MAX_PITCH_DELTA * (pitch > this.soundInstance.pitch ? 1 : -1);
    else
        this.soundInstance.pitch = pitch;
    
    if (!this.soundInstance.volume)
        this.soundInstance.volume = this.ENGINE_VOLUME;
};

// area-selector.js
var AreaSelector = pc.createScript('areaSelector');

AreaSelector.attributes.add('gameArea', {
    type: 'string',
    enum: [
        { 'HIGHWAY': 'highway' },
        { 'ROADSIDE': 'roadside' },
        { 'ROUTE_66': 'route66' }
    ]
});

// initialize code called once per entity
AreaSelector.prototype.initialize = function() {
    var runGame = function () {
        tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
        tr.Storage.gameArea = this.gameArea;
        this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GAME);
    }.bind(this);
    
    this.entity.element.on('click', runGame);
};

// area-model.js
var AreaModel = pc.createScript('areaModel');

AreaModel.attributes.add('modelType', {
    type: 'string',
    enum: [
        { 'ROAD': 'road' },
        { 'CROSSROAD': 'crossroad' }
    ]
});

// initialize code called once per entity
AreaModel.prototype.initialize = function() {
    var onEnable = function () {
            this.entity.model.asset = this.app.assets.findByTag([tr.Storage.gameArea, this.modelType])[0];
        }.bind(this);
    
    this.on('enable', onEnable);
    
    onEnable();
};

// area-enabled.js
var AreaEnabled = pc.createScript('areaEnabled');

AreaEnabled.attributes.add('highway', {
    type: 'boolean',
    default: true
});

AreaEnabled.attributes.add('roadside', {
    type: 'boolean',
    default: true
});

AreaEnabled.attributes.add('route66', {
    type: 'boolean',
    default: true
});

// initialize code called once per entity
AreaEnabled.prototype.initialize = function() {
    var onEnable = function () {
            this.entity.model.enabled = this[tr.Storage.gameArea];
        }.bind(this);
    
    this.on('enable', onEnable);
    
    onEnable();
};

// area-material.js
var AreaMaterial = pc.createScript('areaMaterial');

AreaMaterial.attributes.add('materialType', {
    type: 'string',
    enum: [
        { 'FLOOR': 'floor' }
    ]
});

// initialize code called once per entity
AreaMaterial.prototype.initialize = function() {
    var onEnable = function () {
            this.entity.model.model.meshInstances[0].material = this.app.assets.findByTag([tr.Storage.gameArea, 
                                                                                                this.materialType])[0].resource;
        }.bind(this);
    
    this.on('enable', onEnable);
    
    onEnable();
};

// windmill.js
var Windmill = pc.createScript('windmill');

Windmill.attributes.add('angularVelocity', {
    type: 'number',
    description: 'Wheel angular velocity'
});

// initialize code called once per entity
Windmill.prototype.initialize = function() {        
    this.wheels = this.entity.model.model.graph.find(function (node) {
            return node.name.toLowerCase().indexOf('wheel') >= 0;
        });
};

// update code called every frame
Windmill.prototype.update = function(dt) {
    var angle = this.angularVelocity * dt;
    
    this.wheels.forEach(function (wheel, index) {
        wheel.rotateLocal(0, 0, angle);
    });
};

// oil-pump.js
var OilPump = pc.createScript('oilPump');

// initialize code called once per entity
OilPump.prototype.initialize = function() {
    this.ANGULAR_VELOCITY = 50;
    
    var hammer_eulZ_max = 15,
        hammer_eulZ_min = -19;
    
    this.hammer_eulZ_band = (hammer_eulZ_max - hammer_eulZ_min) / 2;
    this.hammer_offset = this.hammer_eulZ_band - hammer_eulZ_max;
    
    this.hammer = this.entity.model.model.graph.findByName('Hammer');
    this.rotor = this.entity.model.model.graph.findByName('Rotor');
    this.cable = this.entity.model.model.graph.findByName('Cable');
    this.pump = this.entity.model.model.graph.findByName('Pump');
    this.pumpPivot = this.entity.model.model.graph.findByName('PumpPivot');
    this.crJoint = this.entity.model.model.graph.findByName('CR-Joint');
    
    this.rotor.setLocalEulerAngles(0, 0, tr.Utils.getRandomInt(0, 360));
};

// update code called every frame
OilPump.prototype.update = function(dt) {
    this.rotor.rotateLocal(0, 0, this.ANGULAR_VELOCITY * dt);
    
    var rotorEulZ = this.rotor.getLocalEulerAngles().z,
        pumpPivotPos = this.pumpPivot.getPosition(),
        pumpPos = this.pump.getPosition(),
        hammerEulZ = this.hammer_eulZ_band * Math.cos(rotorEulZ * tr.Utils.DEG_TO_RAD) - this.hammer_offset;
    
    this.hammer.setLocalEulerAngles(0, 0, hammerEulZ);
    this.pump.setPosition(pumpPos.x, pumpPivotPos.y, pumpPos.z);
    
    var cablePos = this.cable.getPosition(),
        hammerPos = this.hammer.getPosition(),
        crJointPos = this.crJoint.getPosition(),
        a = cablePos.distance(crJointPos),
        b = hammerPos.distance(crJointPos),
        c = hammerPos.distance(cablePos),
        cableEulZ = Math.acos((Math.pow(a, 2) + Math.pow(c, 2) - Math.pow(b, 2)) / (2 * a * c)) * tr.Utils.RAD_TO_DEG;
    
    this.cable.setLocalEulerAngles(0, 0, cableEulZ);
};


// ridge.js
pc.extend(tr, function () {

    var Ridge = function (template, invertedPivot) {
        this.sumLength = 0;
        this.template = template;
        this.list = [];
        this.invertedPivot = invertedPivot;
    };
    
    Ridge.prototype.push = function (mountain) {
        this.list.push(mountain);
        this.sumLength += mountain.mountainLength;
    };
    
    Ridge.prototype.shift = function () {
        var mountain = this.list.shift();
        this.sumLength -= mountain.mountainLength;
        mountain.destroy();
        mountain = null;
    };
    
    return {
        Ridge: Ridge
    };
    
}());

// stretch.js
var Stretch = pc.createScript('stretch');

Stretch.attributes.add('fitScreen', {
    type: 'boolean',
    default: true,
    title: 'Fit to the screen'
});

// initialize code called once per entity
Stretch.prototype.initialize = function() {
    var aspectRatio = this.entity.element.height / this.entity.element.width,
        UIScreen = this.entity.root.findByName('HUD').screen,
        x,
        y;
        // sideA = this.fitScreen ? 'height' : 'width',
        // sideB = this.fitScreen ? 'width' : 'height';
    
        onCanvasResize = function (e) {
            if (tr.Utils.isLandscape()) {
                // this.entity.element[sideA] = pc.app.graphicsDevice[sideA] / UIScreen.scale;
                // this.entity.element[sideB] = pc.app.graphicsDevice[sideA] * aspectRatio / UIScreen.scale;
                
                x = pc.app.graphicsDevice.width / UIScreen.scale / this.entity.element.width;
                y = x * aspectRatio;
            } else {
                //this.entity.element[sideB] = pc.app.graphicsDevice[sideB] / UIScreen.scale;
                //this.entity.element[sideA] = pc.app.graphicsDevice[sideB] * aspectRatio / UIScreen.scale;

                y = pc.app.graphicsDevice.height / UIScreen.scale / this.entity.element.height;
                x = y * aspectRatio;
            }
            
            this.entity.setLocalScale(x, y, 1);
        }.bind(this);
    
    this.app.graphicsDevice.on('resizecanvas', onCanvasResize);
    
    onCanvasResize();
};

// pan-image.js
var PanImage = pc.createScript('panImage');

// initialize code called once per entity
PanImage.prototype.initialize = function() {
    this.UIScreen = this.entity.root.findByName('HUD').screen;
    
    var onMouseOut = function (e) {
           self.onMouseOut(e);
        };
    
    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        
        this.on('destroy', function() {
            this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
            this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
            
            this.app.graphicsDevice.off('resizecanvas', this.onCanvasResize, this);
        });
    } else {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        
        this.on('destroy', function() {
            this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
            this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);

            this.app.graphicsDevice.off('resizecanvas', this.onCanvasResize, this);
        });
    }
    
    this.app.graphicsDevice.on('resizecanvas', this.onCanvasResize, this);
};

PanImage.prototype.onCanvasResize = function(event) {
    this.pan(0, 0);
};

PanImage.prototype.onMouseDown = function(event) {
    this.dragStart = event;
    
    this.startPosition = this.entity.getLocalPosition().clone();
};

PanImage.prototype.onMouseMove = function(event) {
    if (!this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT))
        return;
    
    var dx = event.x - this.dragStart.x,
        dy = event.y - this.dragStart.y;
    
    this.pan(dx, dy);
};

PanImage.prototype.onTouchStart = function(event) {
    this.dragStart = event.touches[0];
    this.startPosition = this.entity.getLocalPosition().clone();
};

PanImage.prototype.onTouchMove = function(event) {
    var touch = event.touches[0],
        dx = touch.x - this.dragStart.x,
        dy = touch.y - this.dragStart.y;
    
    this.pan(dx, dy);
};

PanImage.prototype.pan = function(dx, dy) {
    var scale = this.entity.getLocalScale(),
        boundX = (this.entity.element.width * scale.x - (pc.app.graphicsDevice.width / this.UIScreen.scale)) / 2,
        boundY = (this.entity.element.height * scale.y - (pc.app.graphicsDevice.height / this.UIScreen.scale)) / 2,
        newX = tr.Utils.bound(this.startPosition.x + dx, boundX),
        newY = tr.Utils.bound(this.startPosition.y - dy, boundY);
    
    this.entity.setLocalPosition(newX, newY, 0);
};


// bike-info.js
var BikeInfo = pc.createScript('bikeInfo');

BikeInfo.attributes.add('powerVal', { type: 'entity', description: 'Power value' });
BikeInfo.attributes.add('powerValNext', { type: 'entity', description: 'Next power value' });
BikeInfo.attributes.add('powerBarBg', { type: 'entity', description: 'Power bar background' });
BikeInfo.attributes.add('powerBarCurrent', { type: 'entity', description: 'Power bar current value' });
BikeInfo.attributes.add('powerBarNext', { type: 'entity', description: 'Power bar next value' });
BikeInfo.attributes.add('powerBarNextBg', { type: 'entity', description: 'Power bar next bg value' });
BikeInfo.attributes.add('wrenchesCurrent', { type: 'entity', description: 'Current wrenches' });
BikeInfo.attributes.add('wrenchesNeeded', { type: 'entity', description: 'Current needed' });
BikeInfo.attributes.add("arrowIcon", { type: "entity", description: 'Arrow icon' });
BikeInfo.attributes.add('cost', { type: 'entity', description: 'Cost' });
BikeInfo.attributes.add('costGroup', { type: 'entity', description: 'Cost group' });
BikeInfo.attributes.add('maxBtn', { type: 'entity', description: 'Max upgrade' });
BikeInfo.attributes.add('upgBtn', { type: 'entity', description: 'Upgrade button' });
BikeInfo.attributes.add('buyBtn', { type: 'entity', description: 'Buy button' });
BikeInfo.attributes.add("lock", { type: "entity", description: 'Lock entity' });
BikeInfo.attributes.add("unlockText", { type: "entity", description: 'Unlock text' });
BikeInfo.attributes.add("specsGroup", { type: "entity", description: 'Power and speed group' });

// initialize code called once per entity
BikeInfo.prototype.initialize = function() {
    this.MAX_SPEED = tr.Storage.getMaxSpeedUpgradedByIndex(10, 3);
    
    var onDisable = function () {
        if (this.powerBarTween)
            this.powerBarTween.pause();
    }.bind(this);
    
    this.upgBtn.element.on('click', function () {
        if (!this.upgActive)
            return;
        
        tr.SoundController.play(tr.Keys.SOUNDS.BIKE_UPGRADE);
        
        tr.Storage.totalCash -= tr.Storage.getUpgradeCost();
        tr.Storage.bikeLevels[tr.Storage.selectedBike - 1]++;
        
        tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.CASH, tr.Storage.totalCash);
        tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.BLEVELS, tr.Storage.bikeLevels);
        
        this.app.fire(tr.Events.BIKE_UPDATE);
    }.bind(this));
    
    this.buyBtn.element.on('click', function () {
        if (!this.buyActive)
            return;
        
        tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
        
        tr.Storage.totalCash -= tr.Storage.getBikeCost();
        tr.Storage.ownBikes[tr.Storage.selectedBike - 1]++;
        
        tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.CASH, tr.Storage.totalCash);
        tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.OBIKES , tr.Storage.ownBikes);
        
        setTimeout(function () {
            this.app.fire(tr.Events.BIKE_UPDATE);
        }.bind(this), 30);
    }.bind(this));
    
    this.on('enable', this.onBikeUpdated, this);
    this.on('disable', onDisable);
    this.app.on(tr.Events.BIKE_UPDATE, this.onBikeUpdated, this);
    
    this.onBikeUpdated();
};

BikeInfo.prototype.onBikeUpdated = function() {
    var bikeUnlocked = tr.Storage.unlockedBikes[tr.Storage.selectedBike - 1],
        bikeOwned = tr.Storage.ownBikes[tr.Storage.selectedBike - 1],
        bikeUpgradable = tr.Storage.getBikeLevel() < 3 && bikeUnlocked && bikeOwned,
        fullyUpgraded = tr.Storage.getBikeLevel() == 3,
        bikeAvailable = bikeUnlocked && !bikeOwned,
        currentSpeed = tr.Storage.getMaxSpeed(),
        nextSpeed = bikeUpgradable ? tr.Storage.getMaxSpeedUpgraded(tr.Storage.getBikeLevel() + 1) : currentSpeed,
        missions = tr.Storage.missionController.missions,
        collectedWrenches = 0,
        neededWrenches = 0;
    
    if (!bikeUnlocked) {
        for (var i = 0; i < missions.length; i++) {
            if (missions[i].mode == tr.Keys.GAME_MODES.RACE) {
                neededWrenches += missions[i].coinsNumber;

                if ((i + 1) < tr.Storage.currentMission)
                    collectedWrenches += missions[i].coinsNumber;

                if (missions[i].bossBike == tr.Storage.selectedBike)
                    break;
            }
        }
    }
    
    this.wrenchesCurrent.element.text = collectedWrenches;
    this.wrenchesNeeded.element.text = ' / ' + neededWrenches;
    
    this.arrowIcon.enabled = bikeUpgradable;
    
    this.powerVal.element.text = currentSpeed;
    this.powerValNext.element.text = bikeUpgradable ? nextSpeed : (bikeOwned ? ' MAX' : '/' + tr.Storage.getMaxSpeedUpgraded(3));
    
    this.powerBarCurrent.element.width = currentSpeed / this.MAX_SPEED * this.powerBarBg.element.width;
    this.powerBarNext.element.width = nextSpeed / this.MAX_SPEED * this.powerBarBg.element.width;
    
    this.unlockText.element.text = tr.Storage.selectedBike < 11 ?
        'Beat THE BOSS on level ' + (tr.Storage.selectedBike - 1) * 4 + ' to UNLOCK' :
        'You SHALL NOT unlock this one!';
    
    this.lock.enabled = !bikeUnlocked;
    this.specsGroup.enabled = bikeUnlocked;
    
    this.maxBtn.enabled = fullyUpgraded;
    this.upgBtn.enabled = bikeUpgradable;
    this.upgActive = tr.Storage.totalCash >= tr.Storage.getUpgradeCost();
    this.upgBtn.element.opacity = this.upgActive ? 1 : 0.4;
    
    this.buyBtn.enabled = bikeAvailable;
    this.buyActive = tr.Storage.totalCash >= tr.Storage.getBikeCost();
    this.buyBtn.element.opacity = this.buyActive ? 1 : 0.4;
    
    this.costGroup.enabled = bikeUpgradable || bikeAvailable;
    this.cost.element.text = bikeAvailable ? tr.Storage.getBikeCost() : tr.Storage.getUpgradeCost();
    
    if (this.powerBarTween)
        this.powerBarTween.resume();
    else 
        this.powerBarTween = this.powerBarNextBg
            .tween(this.powerBarNextBg.element)
            .to({ opacity: 0.3 }, 0.75, pc.Linear)
            .loop(true)
            .yoyo(true)
            .start();
};

// map-screen.js
var MapScreen = pc.createScript('mapScreen');

MapScreen.attributes.add('missionInfo', {
    type: 'entity',
    description: 'Mission info'
});

MapScreen.attributes.add('mapBg', {
    type: 'entity',
    description: 'Map background'
});

MapScreen.attributes.add('shining', {
    type: 'entity',
    description: 'Avatar shining'
});

// initialize code called once per entity
MapScreen.prototype.initialize = function() {
    
    this.MISSION_INFO_OFFSET = 80;
    this.ANIMATION_TIME = 1.0;

                            
                            //CheckpointRunGoal = function (checkpoints, startTime, addTime, distance) 
                            //OvertakeGoal = function (overtakes, startTime)
                            //ComboGoal = function (xCombo, startTime)
                            //RaceGoal = function (startTime, handicap, bossSpeed, bossBike)
                                            
                           //            (traffic,  twoWay,     nightMode,      speed,      reward,     rewardRep,  goal)
//                         //Route 1
//                         new tr.Mission(1,        false,          0,          85,         500,        50,         new tr.CheckpointRunGoal(2, 35, 25, 1)),
//                         new tr.Mission(2,        false,          1,          90,         500,        150,        new tr.OvertakeGoal(4, 60)),               //15s
//                         new tr.Mission(2,        true,           0.3,        95,         500,        50,         new tr.ComboGoal(3, 50)),
//                         new tr.Mission(2,        true,           0.3,        100,        1000,       500,        new tr.RaceGoal(160, 10, 75, 2)),
//                         new tr.Mission(2,        true,           0.3,        105,        1000,       100,        new tr.CheckpointRunGoal(2, 60, 35, 2)),
//                         new tr.Mission(2,        true,           0.3,        110,        1000,       100,        new tr.CheckpointRunGoal(3, 60, 35, 3)),
//                         new tr.Mission(2,        false,          0.3,        115,        1000,       250,        new tr.OvertakeGoal(8, 60)),               //7.5s
//                         new tr.Mission(2,        true,           0.3,        120,        2000,       500,        new tr.RaceGoal(155, 10, 95, 3)),
//                         new tr.Mission(2,        true,           0.3,        125,        1500,       200,        new tr.CheckpointRunGoal(1, 80, 0, 2)),
//                         new tr.Mission(2,        true,           0.3,        130,        1500,       200,        new tr.CheckpointRunGoal(1, 110, 0, 3)),
//                         new tr.Mission(2,        true,           0.3,        135,        1500,       400,        new tr.ComboGoal(6, 50)),
//                         new tr.Mission(2,        true,           0.3,        140,        3000,       500,        new tr.RaceGoal(150, 10, 115, 4)),
//                         
//                         //Route 2                                                 
//                         new tr.Mission(1,        true,           0,        145,        2000,       300,        new tr.CheckpointRunGoal(3, 45, 30, 3)),
//                         new tr.Mission(1,        true,           1,        150,        2000,       300,        new tr.CheckpointRunGoal(2, 65, 55, 4)),
//                         new tr.Mission(2,        false,          0.3,        155,        2000,       750,        new tr.OvertakeGoal(17, 65)),              //3.8s
//                         new tr.Mission(2,        true,           0.3,        160,        4000,       1000,       new tr.RaceGoal(145, 10, 135, 5)),
//                         new tr.Mission(1,        true,           0.3,        165,        3000,       400,        new tr.CheckpointRunGoal(12, 45, 10, 6)),
//                         new tr.Mission(2,        true,           0.3,        170,        3000,       750,        new tr.ComboGoal(9, 50)),
//                         new tr.Mission(1,        false,          0.3,        175,        3000,       750,        new tr.OvertakeGoal(20, 65)),              //3.25s
//                         new tr.Mission(2,        true,           0.3,        180,        5000,       1000,       new tr.RaceGoal(140, 10, 155, 6)),
//                         new tr.Mission(1,        true,           0.3,        185,        4000,       500,        new tr.CheckpointRunGoal(1, 105, 0, 4)),
//                         new tr.Mission(1,        true,           0.3,        190,        4000,       500,        new tr.CheckpointRunGoal(1, 140, 0, 6)),
//                         new tr.Mission(1,        false,          0.3,        195,        4000,       750,        new tr.OvertakeGoal(25, 70)),              //2.8s
//                         new tr.Mission(2,        true,           0.3,        200,        6000,       1000,       new tr.RaceGoal(135, 10, 175, 7)),
//                         
//                         //Route 3                                                 
//                         new tr.Mission(2,        true,           0,        205,        5000,       1000,       new tr.ComboGoal(12, 50)),
//                         new tr.Mission(1,        true,           0.3,      210,        5000,       600,        new tr.CheckpointRunGoal(1, 55, 0, 2)),
//                         new tr.Mission(1,        false,          0.3,        215,        5000,       1000,       new tr.OvertakeGoal(30, 70)),              //2.3s
//                         new tr.Mission(2,        true,           0.3,        220,        7000,       1500,       new tr.RaceGoal(130, 10, 195, 8)),
//                         new tr.Mission(2,        true,           0.3,        225,        6000,       700,        new tr.CheckpointRunGoal(1, 60, 0, 3)),
//                         new tr.Mission(2,        true,           0.3,        230,        6000,       700,        new tr.CheckpointRunGoal(1, 150, 0, 8)),
//                         new tr.Mission(2,        false,          0.3,        235,        6000,       1000,       new tr.OvertakeGoal(15, 35)),              //2.3s
//                         new tr.Mission(2,        true,           0.3,        240,        7000,       1500,       new tr.RaceGoal(125, 10, 215, 9)),
//                         new tr.Mission(2,        false,          0.3,        245,        7000,       800,        new tr.CheckpointRunGoal(4, 30, 30, 4)),
//                         new tr.Mission(2,        true,           0.3,        250,        7000,       800,        new tr.CheckpointRunGoal(6, 45, 15, 6)),
//                         new tr.Mission(2,        false,          0.3,        255,        7000,       1000,       new tr.OvertakeGoal(20, 45)),              //2.2s
//                         new tr.Mission(2,        true,           0.3,        260,        8000,       1500,       new tr.RaceGoal(120, 10, 235, 1
    
    this.passedMissionAsset = this.app.assets.find('level_replay_default.png', 'texture');
    
    this.boss1Portrait = this.app.assets.find('loc_boss1.png', 'texture');
    this.boss2Portrait = this.app.assets.find('loc_boss2.png', 'texture');
    this.boss3Portrait = this.app.assets.find('loc_boss3.png', 'texture');
    this.sidebossPortrait = this.app.assets.find('loc_sideboss.png', 'texture');
    this.tomPortrait = this.app.assets.find('loc_tom.png', 'texture');
    
    this.levels = this.entity.findByTag('mission');
    this.on('enable', this.updateLevels, this);
    this.localPos = this.entity.getLocalPosition();
    
    var hud = this.entity.root.findByName('HUD'),
        
        setMission = function () {
            var self = this.self,
                level = self.levels[this.levelIndex],
                levelPos =  level.getLocalPosition(),
                mission = tr.Storage.missionController.missions[this.levelIndex],
                UIScreen = hud.screen,
                scale = self.entity.getLocalScale(),
                missionInfoHalfW = self.missionInfo.script.missionInfo.halfWidth,
                missionInfoOffset = new pc.Vec2(levelPos.x < 0 ? -missionInfoHalfW : missionInfoHalfW,
                                                levelPos.y < 0 ? -self.MISSION_INFO_OFFSET : self.MISSION_INFO_OFFSET),
                boundX = (self.entity.element.width * scale.x - (pc.app.graphicsDevice.width / UIScreen.scale)) / 2,
                boundY = (self.entity.element.height * scale.y - (pc.app.graphicsDevice.height / UIScreen.scale)) / 2,
                newX = tr.Utils.bound((-levelPos.x + missionInfoOffset.x) * scale.x, boundX),
                newY = tr.Utils.bound((-levelPos.y + missionInfoOffset.y) * scale.y, boundY);
            
            self.moveAnimation = self.entity.tween(self.entity.getLocalPosition())
                .to({x: newX, y: newY, z: 0}, self.ANIMATION_TIME, pc.QuadraticInOut)
                .start();
        
            stopAnimation();
            level.script.animateScale.play();
        
            self.shining.enabled = true;
            self.shining.setLocalPosition(levelPos);

            tr.Storage.mission = mission;
        
            setTimeout(function () {
                if (this.playClick)
                    tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
                
                self.missionInfo.enabled = true;
                self.app.fire(tr.Events.GARAGE_MISSION_SET, mission, levelPos);
            }.bind(this), 30);
        },
        
        clickStart = function (e) {
            this.clickPos = new pc.Vec2(e.x, e.y);
            
            if (this.moveAnimation)
                this.moveAnimation.stop();
        }.bind(this),

        clickEnd = function (e) {
            var newClickPos = e.touch ? new pc.Vec3(e.touch.clientX, e.touch.clientY) : new pc.Vec3(e.x, e.y);
            
            if (this.clickPos && this.clickPos.equals(newClickPos)) {
                this.missionInfo.enabled = false;
                
                //stopAnimation();
            }
        }.bind(this),
        
        onEnable = function () {
            stopAnimation();
            
            if (this.levels.length < tr.Storage.currentMission)
                return;
                    
            setMission.call({self: this, levelIndex: tr.Storage.currentMission - 1});
        }.bind(this),
        
        stopAnimation = function () {
            this.shining.enabled = false;
            
            this.levels.forEach(function (level, index) {
                level.script.animateScale.stop();
            }.bind(this));
        }.bind(this);
    
    this.levels.forEach(function (level, index) {
        level.element.on('click', setMission, {self: this, levelIndex: index, playClick: true});
    }.bind(this));
    
    this.on('enable', onEnable);
    
    this.mapBg.element.on('mousedown', clickStart);
    this.mapBg.element.on('touchstart', clickStart);
    this.mapBg.element.on('mouseup', clickEnd);
    this.mapBg.element.on('touchend', clickEnd);
    
    this.updateLevels();
    
    onEnable();
};

MapScreen.prototype.updateLevels = function() {
    this.missionInfo.enabled = false;
    
    this.levels.forEach(function(level, index) {
        var mission = tr.Storage.missionController.missions[index],
            texture;
        
        level.enabled = index <= tr.Storage.currentMission - 1;
        
        switch(mission.boss) {
            case tr.Keys.BOSSES.SIDEBOSS:
                texture = this.sidebossPortrait;
                break;
                
            case tr.Keys.BOSSES.BOSS_1:
                texture = this.boss1Portrait;
                break;
                
            case tr.Keys.BOSSES.BOSS_2:
                texture = this.boss2Portrait;
                break;
                
            case tr.Keys.BOSSES.BOSS_3:
                texture = this.boss3Portrait;
                break;
        }
        
        if (index < tr.Storage.currentMission - 1 && !texture)
            texture = this.passedMissionAsset;
        else if (!texture)
            texture = this.tomPortrait;
        
        level.element.texture = texture.resource;
    }.bind(this));
};

// game-controller.js
var GameController = pc.createScript('gameController');

GameController.attributes.add("container", {type: "entity"});
GameController.attributes.add("speedHUD", {type: "entity"});
GameController.attributes.add("timeHUD", {type: "entity"});
GameController.attributes.add("timeUnitsHUD", {type: "entity"});
GameController.attributes.add("perksUnitHUD", {type: "entity"});
GameController.attributes.add("goalDetailHUD", {type: "entity"});
GameController.attributes.add("missionProgressHUD", {type: "entity"});
GameController.attributes.add("gameOverHUD", {type: "entity"});
GameController.attributes.add("fader", {type: "entity"});
GameController.attributes.add("settingsButton", {type: "entity"});
GameController.attributes.add("settings", {type: "entity"});
GameController.attributes.add("gauges", {type: "entity"});
GameController.attributes.add("reviveHUD", {type: "entity"});
GameController.attributes.add("bot", {type: "entity"});
GameController.attributes.add("tutorialArrows", {type: "entity"});

// initialize code called once per entity
GameController.prototype.initialize = function() {

    //this.distHUD = this.entity.findByName('distance');
    //this.scoresHUD = this.entity.findByName('scores');
    
    this.acceleration = tr.Storage.acceleration;
    this.timeHUDColor = this.timeHUD.element.color.clone();
    this.wrenchTemplate = this.app.assets.find('Aminated wrench', 'template');
    this.wrenches = [];
    
    this.RED_COLOR = new pc.Color(1, 0, 0, 1);
    
    var onEnable = function () {
    
        var mission = tr.Storage.mission,
            level = tr.Storage.level,
            missionGoals,
            goalDisplay,
            dist,
            combo,
            time,
            cars;
                
        this.wrenches.forEach(function(wrench, index) {
            if (wrench)
                wrench.destroy();
        });
        
        this.whenches = [];
        this.lastReportedLiveScore = 0;
        this.container.enabled = false;
        this.gameOverHUD.enabled = false;
        this.fader.enabled = false;
        //this.missionProgressHUD.enabled = tr.Storage.gameMode == tr.Keys.GAME_MODES.CHECKPOINT_RUN;
        this.timeHUD.enabled = tr.Storage.gameMode != tr.Keys.GAME_MODES.ENDLESS;
        this.timeUnitsHUD.enabled = tr.Storage.gameMode != tr.Keys.GAME_MODES.ENDLESS;
        this.tutorialArrows.enabled = level == 2 || level == 3;

        this.timeHUD.element.text = tr.Storage.getVisibleTime();
        // this.distFunc = tr.Storage.gameMode == tr.Keys.GAME_MODES.CHECKPOINT_RUN ? 
        //     tr.Storage.getVisibleDistanceRem.bind(tr.Storage) : tr.Storage.getVisibleDistance.bind(tr.Storage);

        this.redClock = false;
        this.setTimerColor(this.timeHUDColor);

        this.bot.enabled = tr.Storage.gameMode == tr.Keys.GAME_MODES.RACE;

        this.app.fire(tr.Events.GAME_ENTER);

        this.onResizeCanvas();

        missionGoals = this.goalDetailHUD.findByTag('goal');

        missionGoals.forEach(function (goal, index) {
            goal.enabled = false;
        });

        goalDisplay = this.goalDetailHUD.findByTag(mission.mode)[0];
        goalDisplay.enabled = true;

        if (!this.goalDetailHUDInitPos) 
            this.goalDetailHUDInitPos = this.goalDetailHUD.getLocalPosition().clone();
        else 
             this.goalDetailHUD.setLocalPosition(this.goalDetailHUDInitPos);

        if (!this.goalDetailHUDInitScale) 
            this.goalDetailHUDInitScale = this.goalDetailHUD.getLocalScale().clone();
        else
            this.goalDetailHUD.setLocalScale(this.goalDetailHUDInitScale);

        this.goalDetailHUD.enabled = true;

        this.goalElements = goalDisplay.findComponents('element');
        this.goalElements.forEach(function (element, index) {
            if (element.initOpacity !== undefined)
                element.opacity = element.initOpacity;
            else
                element.initOpacity = element.opacity;
        });

        switch (mission.mode) {
            case tr.Keys.GAME_MODES.CHECKPOINT_RUN:
                dist = goalDisplay.findByName('TextDistance');
                dist.element.text = mission.distance + ' KM';
            break;

            case tr.Keys.GAME_MODES.COMBO:
                combo = goalDisplay.findByName('TextCombo');
                combo.element.text = 'x' + mission.xCombo + ' COMBO';
                time = goalDisplay.findByName('TextTime');
                time.element.text = mission.startTime + ' SEC';
            break;

            case tr.Keys.GAME_MODES.OVERTAKE:
                cars = goalDisplay.findByName('TextCars');
                cars.element.text = mission.overtakes + ' CARS';
                time = goalDisplay.findByName('TextTime');
                time.element.text = mission.startTime + ' SEC';
            break;
        }

        Apicontroller.trackLevelStart({"level": level});        
        window.famobi_analytics.trackEvent("EVENT_LEVELSTART", {levelName: '' + level});
        window.famobi.log('level ' + (level - 1) + ' started');
        famobi.playerReady();
                      
            
    }.bind(this),

    onPlayerOvertake = function (car, combo, side) {
        var perksUnit = this.perksUnitHUD.clone(),
            anchor = perksUnit.element.anchor,
            anchorXZ = side ? 0.35 : 0.65,
            overtakeReward = Math.min(tr.Utils.precisionRound(tr.Config.OVERTAKE_REWARD + 
                                                     tr.Config.OVERTAKE_REWARD_STEP * (combo - 1), 2), 
                                      tr.Config.MAX_COMBO_REWARD);

        anchor.x = anchorXZ;
        anchor.z = anchorXZ;

        perksUnit.enabled = true;
        perksUnit.element.anchor = anchor;

        if (tr.Storage.gameMode != tr.Keys.GAME_MODES.COMBO) {
            tr.Storage.timeRemaining += overtakeReward;
            perksUnit.script.perk.setText('+' + overtakeReward + 's');
        } else {
            perksUnit.script.perk.setText('x' + combo);
        }

        this.perksUnitHUD.parent.addChild(perksUnit);

        if ((tr.Storage.mission.xCombo && tr.Storage.mission.xCombo == combo) || 
                 (tr.Storage.mission.overtakes && tr.Storage.mission.overtakes == tr.Storage.overtakes)) {
            tr.Storage.gameState = tr.Keys.GAME_STATES.PASSED;

            this.app.fire(tr.Events.GAME_OVER);
        }
    }.bind(this),

    onPlayerCheckpoint = function (time) {
        var perksUnit = this.perksUnitHUD.clone(),
            anchor = perksUnit.element.anchor,
            anchorXZ = 0.5;

        anchor.x = anchorXZ;
        anchor.z = anchorXZ;

        perksUnit.enabled = true;
        perksUnit.element.anchor = anchor;
        perksUnit.script.perk.setText('+' + time + 's');

        this.perksUnitHUD.parent.addChild(perksUnit);
    }.bind(this),

    onGameStart = function () {
        var tweenData = {opacity: 1},
            tweenTime = 0.3;

        tr.Storage.gameState = tr.Keys.GAME_STATES.ACTIVE;

        this.container.enabled = true;

        //start tween
        //this.goalDetailHUD.enabled = false;
        this.goalDetailHUD
            .tween(this.goalDetailHUD.getLocalPosition()).to({x: 0, y: 42, z: 0}, tweenTime, pc.SineOut)
            .start();

        this.goalDetailHUD
            .tween(this.goalDetailHUD.getLocalScale()).to({x: 0, y: 0, z: 0}, tweenTime, pc.SineOut)
            .start();

        this.goalDetailHUD
            .tween(tweenData).to({opacity: 0}, tweenTime, pc.SineOut)
            .on('update', function (dt) {
                this.goalElements.forEach(function (element, index) {
                    element.opacity = element.initOpacity * tweenData.opacity;
                }.bind(this));
            }.bind(this))
            .start();

    }.bind(this),

    onGameOver = function () {
        this.container.enabled = false;
        this.reviveHUD.enabled = false;
        this.tutorialArrows.enabled = false;

        if (this.clockSoundInstance)
            this.clockSoundInstance.stop();

        if (tr.Storage.gameState == tr.Keys.GAME_STATES.PASSED)
            tr.SoundController.play(tr.Keys.SOUNDS.LEVEL_WIN);
        else
            tr.SoundController.play(tr.Keys.SOUNDS.LEVEL_FAIL);

        this.fader.enabled = true;

        const gameScore = Math.floor(tr.Storage.distance || 0);

        Apicontroller.handleLevelEndEvent(tr.Storage.gameState == tr.Keys.GAME_STATES.PASSED ? "success" : "fail", gameScore, () => {
            this.app.timeScale = 0.3;
            if(isForcedMode()) {
                famobi.log("Level is finished in forced mode");
                this.app.timeScale = 0;
                this.app.applicationPaused = true;
                this.app.applicationFinished = true;
            } else {
                 tr.Utils.wait(2000)
                    .then(function() {
                        this.app.timeScale = 0;
                        this.gameOverHUD.enabled = true;
                        Apicontroller.trackLevelEnd({
                            "success": tr.Storage.gameState == tr.Keys.GAME_STATES.PASSED, 
                            "score": gameScore
                        });
                }.bind(this));
            }
        });    

    }.bind(this),

    onGameRevive = function () {
        tr.Storage.gameState = tr.Keys.GAME_STATES.PAUSED;

        this.app.timeScale = 0;
        this.container.enabled = false;
        this.reviveHUD.enabled = true;
    }.bind(this),

    onCrashStart = function () {
        tr.Storage.gameState = tr.Keys.GAME_STATES.CRASHED;
        this.container.enabled = false;
    }.bind(this),

    onCrashReset = function () {
        tr.Storage.gameState = tr.Keys.GAME_STATES.ACTIVE;
        this.container.enabled = true;
    }.bind(this),

    onPause = function () {
        tr.Storage.gameState = tr.Keys.GAME_STATES.PAUSED;
        
        this.app.timeScale = 0;

        if (this.clockSoundInstance)
            this.clockSoundInstance.stop();
    }.bind(this),

    onResume = function () {
        tr.Storage.gameState = tr.Keys.GAME_STATES.ACTIVE;

        this.app.timeScale = 1;
        this.reviveHUD.enabled = false;
        this.settings.enabled = false;
        this.container.enabled = true;
    }.bind(this),

    onCoinCollected = function () {
        var wrench = this.wrenchTemplate.resource.instantiate();
        this.wrenches.push(wrench);
        this.container.addChild(wrench);
        wrench.enabled = true;
    }.bind(this),

    onCountdown = function () {
        tr.Storage.gameState = tr.Keys.GAME_STATES.COUNTDOWN;
    }.bind(this);
    
    this.settingsButton.element.on('click', function () {
        tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
        this.settings.enabled = true;
    }.bind(this));
    
    this.app.on(tr.Events.COIN_COLLECTED, onCoinCollected);
    this.app.on(tr.Events.CRASH_START, onCrashStart);
    this.app.on(tr.Events.CRASH_RESET, onCrashReset);
    this.app.on(tr.Events.GAME_PAUSE, onPause);
    this.app.on(tr.Events.GAME_RESUME, onResume);
    this.app.on(tr.Events.PLAYER_OVERTAKE, onPlayerOvertake);
    this.app.on(tr.Events.PLAYER_CHECKPOINT, onPlayerCheckpoint);
    this.app.on(tr.Events.GAME_START, onGameStart);
    this.app.on(tr.Events.GAME_OVER, onGameOver);
    this.app.on(tr.Events.GAME_REVIVE, onGameRevive);
    this.app.on(tr.Events.GAME_COUNTDOWN, onCountdown);
    this.app.graphicsDevice.on('resizecanvas', this.onResizeCanvas, this);
    this.on('enable', onEnable);
    
    this.on('destroy', function () {
        this.app.off(tr.Events.PLAYER_OVERTAKE, onPlayerOvertake);
        this.app.off(tr.Events.PLAYER_CHECKPOINT, onPlayerCheckpoint);
    }.bind(this));
    
    onEnable();
};

GameController.prototype.onResizeCanvas = function () {
    var POSY_PORTRAIT = 125,
        POSY_LANDSCAPE = 30,
        gaugeMargin = this.gauges.element.margin,
        settingsPos = this.settingsButton.getLocalPosition(),
        setLandscape = tr.Utils.isLandscape();

    gaugeMargin.w = setLandscape ? POSY_LANDSCAPE : POSY_PORTRAIT;
    settingsPos.y = setLandscape ? -POSY_LANDSCAPE : -POSY_PORTRAIT + 12;
    
    this.gauges.element.margin = gaugeMargin;
};

GameController.prototype.setTimerColor = function (color) {
    this.timeHUD.element.color = color;
    this.timeUnitsHUD.element.color = color;
};

// update code called every frame
GameController.prototype.update = function(dt) {
    var speed = this.acceleration.velocity,
        time = tr.Storage.getVisibleTime();
    
    this.speedHUD.element.text = Math.round(tr.Utils.msToKmh(speed));
    //this.distHUD.element.text = this.distFunc();
    //this.scoresHUD.element.text = tr.Storage.getVisibleScores();
    this.timeHUD.element.text = tr.Utils.formatTime(time);
    
    if(isExternalPause()) {
        this.settingsButton.enabled = false;
    }
    
    if(Math.floor(tr.Storage.distance) != this.lastReportedLiveScore) {
        this.lastReportedLiveScore = Math.floor(tr.Storage.distance);
        window.famobi_analytics.trackEvent("EVENT_LIVESCORE", {liveScore: this.lastReportedLiveScore});
    }
    
    
    if (time <= 5 && !this.redClock) {
        this.redClock = true;
        this.setTimerColor(this.RED_COLOR);
        
        if (this.clockSoundInstance)
            this.clockSoundInstance.play();
        else
            this.clockSoundInstance = tr.SoundController.play(tr.Keys.SOUNDS.CLOCK_TICKING);
    } else if (time > 5 && this.redClock) {
        this.redClock = false;
        this.setTimerColor(this.timeHUDColor);
        
        if (this.clockSoundInstance)
            this.clockSoundInstance.stop();
    }
};

// screen.js
pc.extend(tr, function () {

    var Screen = function (name) {
        this.name = name;
        this.entity = pc.app.root.findByName(name);
    };
    
    Screen.prototype.show = function () {
        this.entity.enabled = true;
    };
    
    Screen.prototype.hide = function () {
        return new Promise(function (res, rej) {
            this.entity.enabled = false;
            res();
        }.bind(this));
    };
    
    return {
        Screen: Screen
    };
    
}());

// game-screen.js
pc.extend(tr, function () {

    var GameScreen = function () {
        tr.Screen.call(this, tr.Keys.SCREENS.GAME);
    };
    
    GameScreen = pc.inherits(GameScreen, tr.Screen);
    
    GameScreen.prototype.show = function (mission) {
        if (mission)
            tr.Storage.mission = mission;
        
        tr.Screen.prototype.show.call(this);
    };
    
    GameScreen.prototype.hide = function () {
        pc.app.timeScale = 1;
        
        return tr.Screen.prototype.hide.call(this);
    };
    
    return {
        GameScreen: GameScreen
    };
    
}());

// countdown.js
var Countdown = pc.createScript('countdown');

Countdown.attributes.add('countDownText', {
    type: 'entity',
    description: 'Countdown animated text'
});

Countdown.attributes.add('pauseButton', {
    type: 'entity',
    description: 'Pause button'
});

// initialize code called once per entity
Countdown.prototype.initialize = function() {
    var animationName = Object.keys(this.countDownText.animation.animations)[0],
        materials = this.app.assets.findByTag('emissive1to2.5'),
        timeToGo,
        startInt,
        
        countdown = function () {
            if (timeToGo-- == 1) {
                clearInterval(startInt);
                
                //this.countDownText.enabled = false;
                this.pauseButton.enabled = true;
                
                this.countDownText.animation.speed = 1;
                this.app.timeScale = 1;
                this.app.fire(tr.Events.GAME_START);
                
                return;
            }
        }.bind(this),
        
        onEnable = function () {
            timeToGo = 3;
            this.animationStarted = false;
            
            this.pauseButton.enabled = false;
            
            startInt = setInterval(countdown, 1000);
            
            materials.forEach(function (mat, index) {
                mat.resource.emissiveIntensity = tr.Storage.nightMode ? 2.5 : 1;
            });
            
            setTimeout(function () {
                tr.SoundController.play(tr.Keys.SOUNDS.COUNTDOWN);
                
                this.app.timeScale = 0.05;
                
                this.countDownText.enabled = true;
                this.animationStarted = true;
                this.countDownText.animation.play(animationName, 0);
                this.countDownText.animation.currentTime = 0;
                this.countDownText.animation.speed = 26;
            }.bind(this), 0);
        }.bind(this),
        
        onPause = function () {
            this.countDownText.enabled = false;
        }.bind(this);
    
    this.on('enable', onEnable);
    this.app.on(tr.Events.GAME_PAUSE, onPause);
    this.app.on(tr.Events.GAME_COUNTDOWN, onEnable);
    
    onEnable();
};

Countdown.prototype.update = function (dt) {
    if (this.animationStarted && this.countDownText.animation.currentTime >= this.countDownText.animation.duration)
        this.countDownText.enabled = false;
};


// fader.js
var Fader = pc.createScript('fader');

// initialize code called once per entity
Fader.prototype.initialize = function() {
    this.STEP = 0.007;
    this.MAX_OPACITY = 0.9;
    
    var onEnable = function () {
        this.entity.element.opacity = 0;
    }.bind(this);
    
    this.on('enable', onEnable);
    
    onEnable();
};

// update code called every frame
Fader.prototype.update = function(dt) {
    if (this.entity.element.opacity + this.STEP >= this.MAX_OPACITY) {
        this.entity.element.opacity = this.MAX_OPACITY;
        
        return;
    }
        
    this.entity.element.opacity += this.STEP;
};

// swap method called for script hot-reloading
// inherit your script state here
// Fader.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

// wheel-spinner.js
var WheelSpinner = pc.createScript('wheelSpinner');

WheelSpinner.attributes.add('masterEntity', {
    type: 'entity',
    description: 'The master entity where to take velocity from'
});

WheelSpinner.attributes.add('scriptName', {
    type: 'string',
    description: 'Name of script on master entity'
});

WheelSpinner.attributes.add('staticWorld', {
    type: 'boolean',
    default: false,
    description: 'Whether entity moves or the entire world arount entity'
});

// initialize code called once per entity
WheelSpinner.prototype.postInitialize = function() {
    var onModelUpdated = function () {
  
        var aabb;

        this.wheels = this.entity.model.model.graph.find(function (node) {
                return node.name.toLowerCase().indexOf('wheel') >= 0;
            });

        this.entity.model.model.meshInstances.forEach(function (meshInstance, index) {
            if (meshInstance.node.name.toLowerCase().indexOf('wheel') < 0)
                return;

            if (!aabb) {
                aabb = meshInstance.aabb.clone();
                return;
            }

            aabb.add(meshInstance.aabb);
        });

        this.circumference = 2 * Math.PI * aabb.halfExtents.x;
        this.degC = this.circumference / 360;
    }.bind(this);
    
    this.acceleration = tr.Storage.acceleration;
    this.masterScript = this.masterEntity.script[this.scriptName];
    
    this.entity.on(tr.Events.MODEL_UPDATE, onModelUpdated);
    
    onModelUpdated();
};

// update code called every frame
WheelSpinner.prototype.update = function(dt) {
    var velocity = (this.staticWorld ? -this.masterScript.velocity : this.acceleration.velocity + this.masterScript.velocity),
        angle = (velocity / this.degC) * dt;
    
    this.wheels.forEach(function (wheel, index) {
        wheel.rotateLocal(angle, 0, 0);
    });
};


// bot-touch.js
pc.extend(tr, function () {

    var BotTouch = {};

    BotTouch.up = false;
    BotTouch.down = false;
    BotTouch.left = false;
    BotTouch.right = false;
    
    return {
        BotTouch: BotTouch
    };
}());

// hands-animation.js
var HandsAnimation = pc.createScript('handsAnimation');

// initialize code called once per entity
HandsAnimation.prototype.initialize = function() {
    this.acceleration = tr.Storage.acceleration;
    this.blendTime = 0.5;
    
    var onEnable = function () {
        this.throttling = false;
        this.animationName = "";
        
        if (this.entity.animation.assets.length) {
            var assetId = this.entity.animation.assets[0];
            this.animationName = this.app.assets.get(assetId).name;
            this.entity.animation.play(this.animationName, 0);
            this.entity.animation.speed = 0;
        }
    }.bind(this);
    
    this.on('enable', onEnable);
    
    onEnable();
};

// update code called every frame
HandsAnimation.prototype.update = function(dt) {
    if (!this.animationName)
        return;
    
    var cTime;
    
    if (this.acceleration.throttling && !this.throttling) {
        this.entity.animation.play(this.animationName, 0.2);
        this.entity.animation.speed = 2;
        this.throttling = true;
    } else if (!this.acceleration.throttling && this.throttling) {
        cTime = this.entity.animation.currentTime;
        this.entity.animation.play(this.animationName, 0);
        this.entity.animation.currentTime = Math.min(cTime, 1.5);
        this.entity.animation.speed = -2;
        this.throttling = false;
    }
};

// splitscreen.js
pc.extend(tr, function () {

    var Splitscreen = function () {
        tr.Screen.call(this, tr.Keys.SCREENS.SPLITSCREEN);
    };
    
    Splitscreen = pc.inherits(Splitscreen, tr.Screen);
    
    Splitscreen.prototype.show = function () {
        var boss = new URLSearchParams(window.location.search).get('boss') || tr.Storage.mission.boss,
            bossAssetName = boss + '.glb',
            bossModel = pc.app.assets.find(bossAssetName, 'model'),
            animationAsset = pc.app.assets.find(bossAssetName, 'animation'),
            animation = this.entity.findByName('Animation');
        
        animation.model.asset = bossModel;
        
        tr.Screen.prototype.show.call(this);
        
        animation.animation.assets = animationAsset ? [animationAsset] : [];
        animation.animation.play(animationAsset.name, 0);
        animation.animation.currentTime = 0;
        animation.animation.speed = 1;
        
        tr.SoundController.play(tr.Keys.SOUNDS.BOSS_SPLITSCREEN);
        pc.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GAME);
    };
    
    Splitscreen.prototype.hide = function () {
        var animation = this.entity.findByName('Animation');
        
        return new Promise(function (res, rej) {
            if (!tr.Storage.mission)
                return;
            
            tr.Utils.wait(4000)
            .then(function() {
                animation.animation.speed = 0;
                tr.Screen.prototype.hide.call(this).then(res);
            }.bind(this));
        }.bind(this));
    };
    
    return {
        Splitscreen: Splitscreen
    };
    
}());

// mission-info.js
var MissionInfo = pc.createScript('missionInfo');

MissionInfo.attributes.add('powerVal', {
    type: 'entity',
    description: 'Current power value'
});

MissionInfo.attributes.add('powerNeededVal', {
    type: 'entity',
    description: 'Needed power value'
});

MissionInfo.attributes.add('objectiveGroup', {
    type: 'entity',
    description: 'Mission objective group'
});

MissionInfo.attributes.add('lock', {
    type: 'entity',
    description: 'Lock icon'
});

MissionInfo.attributes.add('playBtn', {
    type: 'entity',
    description: 'Play button'
});

MissionInfo.attributes.add('bg', {
    type: 'entity',
    description: 'Background'
});

MissionInfo.attributes.add('upgBtn', {
    type: 'entity',
    description: 'Upgrade button'
});

Object.defineProperty(MissionInfo.prototype, "halfWidth", {
    get: function() {
        return this.bg.element.width * this.entity.getLocalScale().x / 2;
    }
});

Object.defineProperty(MissionInfo.prototype, "halfHeight", {
    get: function() {
        return this.bg.element.height * this.entity.getLocalScale().y / 2;
    }
});

// initialize code called once per entity
MissionInfo.prototype.initialize = function() {
    this.PADDING = 10;
    
    var onDisable = function () {
        if (this.powerAnimation)
            this.powerAnimation.pause();
    }.bind(this);
    
    this.playBtn.element.on('click', function () {
        var levelNum = tr.Storage.level - 1;
        
        tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
        
        if (levelNum < 12)
            tr.Storage.gameArea = tr.Keys.GAME_AREAS.HIGHWAY;
        else if (levelNum < 24)
            tr.Storage.gameArea = tr.Keys.GAME_AREAS.ROADSIDE;
        else
            tr.Storage.gameArea = tr.Keys.GAME_AREAS.ROUTE66;
        
        if (this.mission.mode == tr.Keys.GAME_MODES.RACE)
            this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.SPLITSCREEN);
        else
            this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GAME);
    }.bind(this));
    
    this.upgBtn.element.on('click', function () { 
        tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
        
        this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GARAGE);
    }.bind(this));
    
    this.on('enable', this.onBikeUpdated, this);
    this.on('disable', onDisable);
    this.app.on(tr.Events.GARAGE_MISSION_SET, this.onMissionSet, this);
    
    this.missionGoals = this.objectiveGroup.findByTag('goal');
};

MissionInfo.prototype.onMissionSet = function(mission, pos) {
    var maxSpeed = tr.Storage.getMaxSpeedByIndex(tr.Storage.ownBikes.lastIndexOf(1)),
        x = pos.x < 0 ? pos.x + this.halfWidth + this.PADDING : pos.x - this.halfWidth - this.PADDING,
        y = pos.y < 0 ? pos.y + this.halfHeight + this.PADDING : pos.y - this.halfHeight - this.PADDING,
        
        goalDisplay = this.objectiveGroup.findByTag(mission.mode)[0],
        dist,
        combo,
        time,
        cars;
    
    this.missionGoals.forEach(function (goal, index) {
        goal.enabled = false;
    });
    
    goalDisplay.enabled = true;
    
    switch (mission.mode) {
        case tr.Keys.GAME_MODES.CHECKPOINT_RUN:
            dist = goalDisplay.findByName('TextDistance');
            dist.element.text = mission.distance + ' KM';
        break;
            
        case tr.Keys.GAME_MODES.COMBO:
            combo = goalDisplay.findByName('TextCombo');
            combo.element.text = 'x' + mission.xCombo + ' COMBO';
            time = goalDisplay.findByName('TextTime');
            time.element.text = mission.startTime + ' SEC';
        break;
            
        case tr.Keys.GAME_MODES.OVERTAKE:
            cars = goalDisplay.findByName('TextCars');
            cars.element.text = mission.overtakes + ' CARS';
            time = goalDisplay.findByName('TextTime');
            time.element.text = mission.startTime + ' SEC';
        break;
    }
    
    this.mission = mission;
    this.powerVal.element.text = maxSpeed;
    this.powerNeededVal.element.text = '/ ' + mission.entryBikeSpeed;
    this.playBtn.enabled = maxSpeed >= mission.entryBikeSpeed;
    this.lock.enabled = maxSpeed < mission.entryBikeSpeed;
    this.upgBtn.enabled = maxSpeed < mission.entryBikeSpeed;
    
    this.entity.setLocalPosition(x, y, 0);
    
    //EF6C18
    if (maxSpeed < mission.entryBikeSpeed) {
        if (!this.powerAnimation) {
            this.powerColor = this.powerVal.element.color.clone();
            this.tweenColor = this.powerVal.element.color.clone();
            this.powerAnimation = this.powerVal
                .tween(this.tweenColor)
                .to({r: 1, g: 0, b: 0}, 0.5, pc.Linear)
                .loop(true)
                .yoyo(true)
                .on('update', function () {
                    this.powerVal.element.color = this.tweenColor;
                }.bind(this))
                .start();
        } else if (!this.powerAnimation.playing) {
            this.powerVal.element.color = this.powerColor;
            this.tweenColor.copy(this.powerColor);
            this.powerAnimation.start();
        }
    } else if (this.powerAnimation) {
        this.powerAnimation.stop();
        this.powerVal.element.color = this.powerColor;
    }
};

// mission-progress.js
var MissionProgress = pc.createScript('missionProgress');

MissionProgress.attributes.add('mask', {
    type: 'entity'
});

MissionProgress.attributes.add('bar', {
    type: 'entity'
});

MissionProgress.attributes.add('bg', {
    type: 'entity'
});

MissionProgress.attributes.add('bgNight', {
    type: 'entity'
});

MissionProgress.attributes.add('progress', {
    type: 'entity'
});

MissionProgress.attributes.add('bike', {
    type: 'entity'
});

MissionProgress.attributes.add('missionObjGroup', {
    type: 'entity'
});

MissionProgress.attributes.add('missionComboGroup', {
    type: 'entity'
});

MissionProgress.attributes.add('missionOvertakeGroup', {
    type: 'entity'
});

// initialize code called once per entity
MissionProgress.prototype.initialize = function() {
    this.BIKE_OFFSET = -4;
    this.FLAG_OFFSET_Y = 25;
    this.flags = [];
    this.goals = this.missionObjGroup.findByTag('goal');
    
    var flagTemplate = this.app.assets.find('Flag', 'template'),
        blackFlagTexture = this.app.assets.find('flag_f.png', 'texture'),
        
        onEnable = function () {
            var checkpoints,
                goalElements,
                flag,
                i;
        
            this.flags.forEach(function(flag, index) {
                flag.destroy();
            });
            
            this.flags = [];
            this.progressW = 0;
        
            this.mask.element.width = 0;
            this.checkpointNum = 0;
            
            this.bg.enabled = tr.Storage.gameMode != tr.Keys.GAME_MODES.RACE && !tr.Storage.nightMode;
            this.bgNight.enabled = tr.Storage.gameMode != tr.Keys.GAME_MODES.RACE && tr.Storage.nightMode;
            this.missionOvertakeGroup.enabled = tr.Storage.gameMode == tr.Keys.GAME_MODES.OVERTAKE;
            this.missionComboGroup.enabled = tr.Storage.gameMode == tr.Keys.GAME_MODES.COMBO;
            this.mask.enabled = tr.Storage.gameMode != tr.Keys.GAME_MODES.RACE;
            this.bike.enabled = tr.Storage.gameMode == tr.Keys.GAME_MODES.CHECKPOINT_RUN;
            
            this.bike.setLocalPosition(-this.BIKE_OFFSET, 0, 0);
        
            this.goals.forEach(function (goal, index) {
                goal.enabled = false;
            });
            
            this.goal = this.missionObjGroup.findByTag(tr.Storage.gameMode)[0];
            this.goal.enabled = true;
            
            this.goal.setLocalScale(0, 0, 0);
            
            goalElements = this.goal.findComponents('element');
            goalElements.forEach(function (element, index) {
                if (element.initOpacity !== undefined)
                    element.opacity = element.initOpacity;
                else
                    element.initOpacity = element.opacity;
            });
            
            var tweenData = {opacity: 0},
                tweenTime = 0.4,
                delay = 0.1;
            
            this.goal
                .tween(this.goal.getLocalScale()).to({x: 1, y: 1, z: 1}, tweenTime, pc.SineOut)
                .delay(delay)
                .start();
            
            this.goal
                .tween(tweenData).to({opacity: 1}, tweenTime, pc.SineOut)
                .on('update', function (dt) {
                    goalElements.forEach(function (element, index) {
                        if (element.initOpacity !== null)
                            element.opacity = element.initOpacity * tweenData.opacity;
                    }.bind(this));
                }.bind(this))
                .delay(delay)
                .start();
            
            switch (tr.Storage.gameMode) {
                case (tr.Keys.GAME_MODES.CHECKPOINT_RUN):
                    this.distCnt = this.goal.findByName('DistanceCounter');
                    this.distCnt.element.text = tr.Storage.distanceRem;
                    checkpoints = tr.Storage.mission.checkpoints + 1;
                    break;
                    
                case (tr.Keys.GAME_MODES.OVERTAKE):
                    this.overtakesCnt = this.goal.findByName('OvertakesCounter');
                    updateOvertakesBar();
                    checkpoints = 1; //tr.Storage.mission.overtakes;
                    break;
                    
                case (tr.Keys.GAME_MODES.COMBO):
                    this.combosCnt = this.goal.findByName('CombosCounter');
                    updateComboBar(0);
                    checkpoints = 1; //tr.Storage.mission.xCombo;
                    break;
                    
                case (tr.Keys.GAME_MODES.RACE):
                    this.coinsCnt = this.goal.findByName('WrenchCounter');
                    updateRaceBar();
                    checkpoints = 0; //tr.Storage.mission.coinsNumber;
                    break;
            }
            
            for (i = 0; i < checkpoints; i++) {
                flag = flagTemplate.resource.instantiate();
                this.flags.push(flag);
                this.bar.insertChild(flag, 3);
                // this.entity.addChild(flag);
                flag.enabled = true;

                flag.setLocalPosition(this.progress.element.width / checkpoints * (i + 1), this.FLAG_OFFSET_Y, 0);
            }
            
            this.timeSinceCombo = 0;
        }.bind(this),
        
        updateOvertakesBar = function () {
            var width = this.progress.element.width * (tr.Storage.overtakes / tr.Storage.mission.overtakes);
            this.mask.element.width = width;

            if (this.overtakesCnt)
                this.overtakesCnt.element.text = tr.Storage.overtakes + '/' + tr.Storage.mission.overtakes;
            
            updateBarBike(width);
        }.bind(this),
        
        updateComboBar = function (combo) {
            var width = 0;
            
            this.progressW = this.progress.element.width * (combo / tr.Storage.mission.xCombo);
            this.timeSinceCombo = 0;
            width = this.progressW;

            if (this.mask.element.width < width)
                this.mask.element.width = width;

            if (this.combosCnt)
                this.combosCnt.element.text = combo + '/' + tr.Storage.mission.xCombo;
            
            updateBarBike(width);
        }.bind(this),
        
        updateBarBike = function (width) {
            this.bike.setLocalPosition(width - this.BIKE_OFFSET, 0, 0);
        }.bind(this),
        
        updateRaceBar = function () {
            var width = this.progress.element.width * (tr.Storage.coins / tr.Storage.mission.coinsNumber);
            this.mask.element.width = width;

            if (this.coinsCnt)
                this.coinsCnt.element.text = tr.Storage.coins + '/' + tr.Storage.mission.coinsNumber;
            
            //updateBarBike(width);
        }.bind(this),
        
        onPlayerOvertake = function (car, combo, side) {
            if (tr.Storage.gameMode == tr.Keys.GAME_MODES.OVERTAKE) {
                updateOvertakesBar();
            } else if (tr.Storage.gameMode == tr.Keys.GAME_MODES.COMBO) {
                updateComboBar(combo);
            }
        }.bind(this),
        
        onPlayerCheckpoint = function () {
            var flag = this.flags[this.checkpointNum++];
            flag.element.texture = blackFlagTexture.resource;
        }.bind(this);
    
    this.app.on(tr.Events.PLAYER_OVERTAKE, onPlayerOvertake);
    this.app.on(tr.Events.COIN_COLLECTED, updateRaceBar);
    this.app.on(tr.Events.PLAYER_CHECKPOINT, onPlayerCheckpoint);
    this.on('enable', onEnable);
    
    onEnable();
};

// update code called every frame
MissionProgress.prototype.update = function(dt) {
    var width = 0;
    
    switch (tr.Storage.gameMode) {
        case (tr.Keys.GAME_MODES.CHECKPOINT_RUN):
            
            width = this.progress.element.width * (tr.Storage.distance / (tr.Storage.mission.distance * 1000));
            this.mask.element.width = width;
            this.bike.setLocalPosition(width - this.BIKE_OFFSET, 0, 0);
            
            this.distCnt.element.text = tr.Storage.getVisibleDistanceRem();
            break;
            
        case (tr.Keys.GAME_MODES.COMBO):
            this.timeSinceCombo += dt;
            width = Math.max(0, this.progressW * (1 - (this.timeSinceCombo / tr.Config.COMBO_INT)));
            
            this.mask.element.width = width;
            break;
    }
};

// loading-screen.js
pc.script.createLoadingScreen(function (app) {
    var showSplash = function () {
        // splash wrapper
        var wrapper = document.createElement('div');
        wrapper.id = 'application-splash-wrapper';
        document.body.appendChild(wrapper);

        // splash
        var splash = document.createElement('div');
        splash.id = 'application-splash';
        wrapper.appendChild(splash);
        splash.style.display = 'none';

        var logo = document.createElement('img');
        logo.src = 'data:image/png;base64,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';
        splash.appendChild(logo);
        logo.onload = function () {
            splash.style.display = 'block';
        };

        var container = document.createElement('div');
        container.id = 'progress-bar-container';
        splash.appendChild(container);

        var bar = document.createElement('div');
        bar.id = 'progress-bar';
        container.appendChild(bar);

    };

    var hideSplash = function () {
        var splash = document.getElementById('application-splash-wrapper');
        splash.parentElement.removeChild(splash);
    };

    var setProgress = function (value) {
        var bar = document.getElementById('progress-bar');
        if(bar) {
            value = Math.min(1, Math.max(0, value));
            bar.style.width = value * 100 + '%';
        }
        
        const loadingProgressValue = value * 99; 
        if(window.famobi) {
            window.famobi.setPreloadProgress(Math.floor(loadingProgressValue));
        }
    };

    var createCss = function () {
        var css = [
            'body {',
            '   background-color: #283538;',
            '   -webkit-user-select: none;',
            '   -khtml-user-select: none;',
            '   -moz-user-select: none;',
            '   -ms-user-select: none;',
            '   user-select: none;',
            '}',

            '#application-splash-wrapper {',
            '    position: absolute;',
            '    top: 0;',
            '    left: 0;',
            '    height: 100%;',
            '    width: 100%;',
            '    background-color: #283538;',
            '}',

            '#application-splash {',
            '    position: absolute;',
            '    top: calc(50% - 132px);',
            '    width: 264px;',
            '    left: calc(50% - 132px);',
            '}',

            '#application-splash img {',
            '    width: 100%;',
            '}',

            '#progress-bar-container {',
            '    margin: 10px auto 0 auto;',
            '    border-radius: 6px;',
            '    height: 6px;',
            '    width: 80%;',
            '    background-color: #051e1e;',
            '}',

            '#progress-bar {',
            '    width: 0%;',
            '    border-radius: 6px;',
            '    height: 100%;',
            '    background: linear-gradient(#b7251f, #ef6e28);',
            '}',
            '@media (max-width: 480px) {',
            '    #application-splash {',
            '        width: 170px;',
            '        left: calc(50% - 85px);',
            '    }',
            '}'
        ].join("\n");

        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
    };


      
    var injectForcedModeProperties = function() {
        console.warn('Injecting forced mode properties...');
        const forcedModeProperties = getForcedModeProperties();
        if(forcedModeProperties.state.level) {
            //TODO inject proper forced mode level
        }
    };
        
    var doAPIHandshake = function(startGameCallback) {   
        if(isExternalStart()) {
            app.timeScale = 0;
            famobi.onRequest("startGame", function() {
                app.timeScale = 1.0;                               
                if(startGameCallback) startGameCallback();
            });
        } else {
            if(startGameCallback) startGameCallback();
        }
        
        /* game ready report */
        famobi.gameReady();
    };
    
    
    var startLevelDirectly = function() {
        app.once(tr.Events.GARAGE_SCREEN_LOADED, () => hideSplash()); 
        
        /* timeout is a must to let the game properly initialize level */
        setTimeout(() => doAPIHandshake(() => {
            famobi.log('Handshake completed, skip_title mode');
        }), 0);
    };
    
    
    createCss();

    showSplash();
    
        
    app.on('preload:end', function () {
        app.off('preload:progress');       
    });
    app.on('preload:progress', setProgress);
    // app.on('start', hideSplash);
    app.on('start', function() {
        
        /* game is loaded, send final progress to Famobi API. */
        famobi.setPreloadProgress(100);
        
        /* inject forced mode properties if needed */
        if(isForcedMode()) {
            injectForcedModeProperties();
        }
        
        /* if "skip_title" feature is present, start the gameplay/level screen directly */
        if(skipTitleScreen()) {
             startLevelDirectly();                
        } else {
            /* hide preloader */
            hideSplash();
            
            /* timeout is a must to let the game properly initialize a level */
            setTimeout(() => doAPIHandshake(() => {
                famobi.log('Handshake completed in normal gameplay mode');
            }), 0);
            
        }   
        
    });
});

// animate-number.js
var AnimateNumber = pc.createScript('animateNumber');

AnimateNumber.attributes.add('playSound', {
    type: 'boolean',
    default: false
});

AnimateNumber.attributes.add('duration', {
    type: 'number',
    default: 1
});

AnimateNumber.attributes.add('prefix', {
    type: 'string',
    default: ''
});

AnimateNumber.attributes.add('postfix', {
    type: 'string',
    default: ''
});

// initialize code called once per entity
AnimateNumber.prototype.initialize = function() {
    
};

AnimateNumber.prototype._numberToText = function(number) {
    this.entity.element.text = this.prefix + number.toFixed(this.precision) + this.postfix;
};

AnimateNumber.prototype.set = function(num, reset) {
    if (reset) {
        this.displayedNum = 0;
        this._numberToText(0);
    }
    
    num = Number.parseFloat(num);
    
    this.calcStep(num);
    this.numberTotal = num;
    this.displayedNum = this.displayedNum || 0;
    this.precision = tr.Utils.precision(num);
    this._numberToText(this.displayedNum);
    
    if (this.playSound)
        tr.SoundController.play(tr.Keys.SOUNDS.EARN_MONEY);
};

AnimateNumber.prototype.calcStep = function(num) {
    this.step = num / (this.duration * 60);
};

// update code called every frame
AnimateNumber.prototype.update = function(dt) {
    if (this.displayedNum == this.numberTotal)
        return;
    
    if (this.step > Math.abs(this.displayedNum - this.numberTotal))
        this.displayedNum = this.numberTotal;
    else if (this.displayedNum < this.numberTotal)
        this.displayedNum += this.step;
    else if (this.displayedNum > this.numberTotal)
        this.displayedNum -= this.step;
    
    this._numberToText(this.displayedNum);
};

// animate-scale.js
var AnimateScale = pc.createScript('animateScale');

AnimateScale.attributes.add("offsetCurve", {type: "curve", title: "Offset Curve", curves: [ 'x', 'y', 'z' ]});
AnimateScale.attributes.add("duration", {type: "number", default: 3, title: "Duration (secs)"});
AnimateScale.attributes.add('loop', {
    title: 'Loop animation',
    type: 'boolean',
    default: false
});
AnimateScale.attributes.add('autoPlay', {
    title: 'Auto play',
    type: 'boolean',
    default: false
});
AnimateScale.attributes.add('ignoreTimeScale', {
    title: 'Ignore time scale',
    type: 'boolean',
    default: false
});

// initialize code called once per entity
AnimateScale.prototype.initialize = function() {
    // Store the original scale of the entity so we can offset from it
    this.startScale = this.entity.getLocalScale().clone();
    
    // Keep track of the current scale
    this.scale = new pc.Vec3();
    
    if (!this.autoPlay)
        this.enabled = false;
    else 
        this.play();
};

AnimateScale.prototype.play = function() {
    if (!this.startScale)
        this.autoPlay = true;
    
    this.time = 0;
    this.isPlaying = true;
    this.enabled = true;
};

AnimateScale.prototype.stop = function() {
    if (!this.isPlaying)
        return;
    
    this.time = 0;
    this.updateAnimation();
    this.enabled = false;
    this.isPlaying = false;
};

AnimateScale.prototype.updateAnimation = function() {
    var percent = this.time / this.duration;
    
    // Get curve values using current time relative to duration (percent)
    // The offsetCurve has 3 curves (x, y, z) so the returned value will be a set of 
    // 3 values
    this.curveValue = this.offsetCurve.value(percent);
    
    // Create our new position from the startScale and curveValue
    this.scale.copy(this.startScale);
    this.scale.x = this.curveValue[0];
    this.scale.y = this.curveValue[1];
    this.scale.z = this.curveValue[2];
    
    this.entity.setLocalScale(this.scale);
};
 
AnimateScale.prototype.update = function(dt) {
    this.time += this.ignoreTimeScale ? 0.016 : dt;
    
    // Loop the animation forever
    if (this.loop && this.time > this.duration) {
        this.time -= this.duration;
    } else if (!this.loop && this.time > this.duration) {
        this.enabled = false;
    }
    
    // Calculate how far in time we are for the animation
    this.updateAnimation();
};


// adaptive-scale.js
var AdaptiveScale = pc.createScript('adaptiveScale');

AdaptiveScale.attributes.add('background', {
    title: 'background element',
    type: 'entity'
});

// initialize code called once per entity
AdaptiveScale.prototype.initialize = function() {
    var bgWidth = this.background.element.width,
        initScale = this.entity.getLocalScale().clone(),
        UIScreen = tr.Utils.findUIScreen(this.entity),
        newScale,
    
        onCanvasResize = function (e) {
            if (tr.Utils.isLandscape()) {
                this.entity.setLocalScale(initScale);
                
                return;
            }
            
            newScale = (bgWidth * UIScreen.scale > pc.app.graphicsDevice.width) ? 
                pc.app.graphicsDevice.width / bgWidth / UIScreen.scale : 1;
            
            this.entity.setLocalScale(newScale, newScale, newScale);
        }.bind(this);
    
    pc.app.graphicsDevice.on('resizecanvas', onCanvasResize);
    
    onCanvasResize();
};

// sound-settings.js
var SoundSettings = pc.createScript('soundSettings');

SoundSettings.attributes.add('musicGroup', {type: 'entity'});
SoundSettings.attributes.add('sfxGroup', {type: 'entity'});

// initialize code called once per entity
SoundSettings.prototype.initialize = function() {
    var toggleOnAsset = this.app.assets.find('toggle_on.png', 'texture'),
        toggleOffAsset = this.app.assets.find('toggle_off.png', 'texture'),
    
        onSoundChanged = function () {
            tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.SOUND, tr.Storage.sound);
        
            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);

            window.famobi_analytics.trackEvent("EVENT_VOLUMECHANGE", 
                                           {bgmVolume: Number(tr.Storage.sound.music), sfxVolume: Number(tr.Storage.sound.sfx)});
        }.bind(this),
    
        updateMusic = function () {
            tr.MusicController.enabled = tr.Storage.sound.music;
        
            this.musicGroup.findByName('toggle').element.texture = tr.Storage.sound.music ? 
                toggleOnAsset.resource : toggleOffAsset.resource;
        }.bind(this),
        
        updateSfx = function () {
            tr.SoundController.enabled = tr.Storage.sound.sfx;

            this.sfxGroup.findByName('toggle').element.texture = tr.Storage.sound.sfx ? 
                toggleOnAsset.resource : toggleOffAsset.resource;
        }.bind(this),
        
        onEnable = function () {
            updateMusic();
            updateSfx();
        }.bind(this);
    
    this.musicGroup.element.on('click', function (event) { 
        tr.Storage.sound.music = !tr.Storage.sound.music;
        
        updateMusic();
        onSoundChanged();
        
        this.app.fire(tr.Events.SOUND_MUSIC);
    }.bind(this), this);
    
    this.sfxGroup.element.on('click', function (event) {
        tr.Storage.sound.sfx = !tr.Storage.sound.sfx;
        
        updateSfx();
        onSoundChanged();
        
        this.app.fire(tr.Events.SOUND_SFX);
    }.bind(this), this);
    
    this.on('enable', onEnable);
    
    this.app.on(tr.Events.API_ENABLE_AUDIO, updateSfx);
    this.app.on(tr.Events.API_DISABLE_AUDIO, updateSfx);
    this.app.on(tr.Events.API_ENABLE_MUSIC, updateMusic);
    this.app.on(tr.Events.API_DISABLE_MUSIC, updateMusic);
    
    onEnable();
};

// game-settings.js
var GameSettings = pc.createScript('gameSettings');

GameSettings.attributes.add('restartBtn', {type: 'entity'});
GameSettings.attributes.add('homeBtn', {type: 'entity'});
GameSettings.attributes.add('backBtn', {type: 'entity'});
GameSettings.attributes.add('soundGroup', {type: 'entity'});

// initialize code called once per entity
GameSettings.prototype.initialize = function() {
    
    var onHomeClick = function () {
            disable();
        
            window.famobi_analytics.trackEvent("EVENT_LEVELFAIL", 
                                               {levelName: '' + tr.Storage.level, reason: "quit"}).then(() => {
                //tr.Storage.mapRequest = true;
                this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GARAGE);
            });
            
        }.bind(this),
        
        onRestartClick = function () {
            disable();
            
            this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GAME, tr.Storage.mission);
        }.bind(this),
        
        onEnabled = function () {
            this.app.fire(tr.Events.GAME_PAUSE);
            window.famobi_analytics.trackEvent("EVENT_PAUSE");
        }.bind(this),
        
        disable = function () {
            window.famobi_analytics.trackEvent("EVENT_RESUME").then(() => {
                tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            
                this.app.timeScale = 1;
                this.entity.enabled = false;
                this.app.fire(tr.Events.GAME_RESUME);
            });
        }.bind(this);
    
    this.on('enable', onEnabled);
    
    this.backBtn.element.on('click', disable);
    
    this.restartBtn.element.on('click', onRestartClick);
    this.homeBtn.element.on('click', onHomeClick);
    
    onEnabled();
};

GameSettings.prototype.update = function(dt) {
    this.soundGroup.enabled = !isExternalMute();
};


// garage-settings.js
var GarageSettings = pc.createScript('garageSettings');

GarageSettings.attributes.add('unlockBikesBtn', {type: 'entity'});
GarageSettings.attributes.add('unlockLevelsBtn', {type: 'entity'});
GarageSettings.attributes.add('getTheMoneyBtn', {type: 'entity'});
GarageSettings.attributes.add('resetBtn', {type: 'entity'});

GarageSettings.attributes.add('backBtn', {type: 'entity'});

// initialize code called once per entity
GarageSettings.prototype.initialize = function() {
    var onEnabled = function () {
            
        }.bind(this),
        
        disable = function () {
            setTimeout(function () {
                tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
                this.entity.enabled = false;
            }.bind(this), 30);
        }.bind(this),
        
        reset = function (e) {
            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            
            tr.Storage.totalCash = 0;
            tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.CASH, tr.Storage.totalCash);
            
            tr.Storage.ownBikes = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.OBIKES , tr.Storage.ownBikes);
            
            tr.Storage.unlockedBikes = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.UBIKES , tr.Storage.unlockedBikes);
            
            tr.Storage.bikeLevels = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.BLEVELS , tr.Storage.bikeLevels);
            
            tr.Storage.currentMission = 1;
            tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.CMISSION, tr.Storage.currentMission);
            
            this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GARAGE);
        }.bind(this),
        
        getTheMoney = function (e) {
            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            
            tr.Storage.totalCash += 100000;
            tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.CASH, tr.Storage.totalCash);

            this.app.fire(tr.Events.BIKE_UPDATE);
        }.bind(this),
        
        unlockTheBikes = function (e) {
            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            
            tr.Storage.unlockedBikes = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
            tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.UBIKES , tr.Storage.unlockedBikes);
            
            this.app.fire(tr.Events.BIKE_UPDATE);
        }.bind(this),
        
        unlockTheLevels = function (e) {
            tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
            
            tr.Storage.currentMission = 37;
            tr.Utils.setStorageItem(tr.Keys.STORAGE_KEYS.CMISSION, tr.Storage.currentMission);
            
            this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GARAGE);
        }.bind(this);
    
    this.on('enable', onEnabled);
    
    this.backBtn.element.on('click', disable);
    
    this.unlockBikesBtn.element.on('click', unlockTheBikes);
    this.unlockLevelsBtn.element.on('click', unlockTheLevels);
    this.getTheMoneyBtn.element.on('click', getTheMoney);
    this.resetBtn.element.on('click', reset);
       
    onEnabled();

};



// perk.js
var Perk = pc.createScript('perk');

// initialize code called once per entity
Perk.prototype.initialize = function() {
    this.SYMBOL_DELAY = 30;
    
    this.characters = [];
    ///this.perkTemplate = this.app.assets.find('Perk symbol', 'template');
    this.perkEntity = this.entity.findByName('perk');
    
    if (this.text)
        this.runTextAnimation(this.text);
};

Perk.prototype.setText = function (text) {
    this.text = text;
    
    if (!this.enabled)
        return;
    
    this.runTextAnimation(text);
};

Perk.prototype.createSymbol = function (char) {
    var symbol,
        texture;
    
    if (tr.Storage.gameState < tr.Keys.GAME_STATES.PAUSED)
        return;
    
    texture = this.app.assets.findByTag(['font', 'symbol_' + char])[0];
    //symbol = this.perkTemplate.resource.instantiate();
    symbol = this.perkEntity.clone();
    symbol.element.texture = texture.resource;
    symbol.enabled = true;
    this.entity.addChild(symbol);
    this.characters.push(symbol);
    
    if (char == '.')
        symbol.element.width *= 0.75;
};

Perk.prototype.runTextAnimation = function (text) {
    var i;
    
    this.characters.forEach(function (char, index) {
        char.destroy();
    });
    
    this.characters = [];
    
    for (i = 0; i < text.length; i++) {
        tr.Utils.wait(i * this.SYMBOL_DELAY).then(this.createSymbol.bind(this, text[i]));
    }
};

// update code called every frame
Perk.prototype.update = function(dt) {
    if ((this.characters.length && this.entity.children.length == 1) || (tr.Storage.gameState < tr.Keys.GAME_STATES.PAUSED)) {
        this.enabled = false;
        this.entity.destroy();
    }
};

// firework.js
var Firework = pc.createScript('firework');

Firework.attributes.add('firework', {
    type: 'entity',
    description: 'The firework'
});

// initialize code called once per entity
Firework.prototype.initialize = function() {
    var animationName = Object.keys(this.firework.animation.animations)[0],
        
        onGameOver = function () {
            if (tr.Storage.gameState == tr.Keys.GAME_STATES.FAILED)
                return;
            
            this.animationStarted = false;
            
            setTimeout(function () {
                this.firework.enabled = true;
                this.animationStarted = true;
                this.firework.animation.play(animationName, 0);
                this.firework.animation.currentTime = 0;
                this.firework.animation.speed = 1 / 0.3;
            }.bind(this), 0);
        }.bind(this),
        
        reset = function () {
            this.firework.enabled = false;
            this.animationStarted = false;
        }.bind(this);
    
    this.app.on(tr.Events.GAME_OVER, onGameOver);
    this.on('enable', reset);
    
    reset();
};

Firework.prototype.update = function (dt) {
    if (!this.firework.animation || 
        (this.animationStarted && this.firework.animation.currentTime >= this.firework.animation.duration))
        this.firework.enabled = false;
};


// bot-bike.js
var BotBike = pc.createScript('botBike');

BotBike.BODY = 'bike_body';
BotBike.HANDLEBAR = 'bike_handlebar';
BotBike.RIDER = 'bike_rider';

BotBike.attributes.add('bikePart', {
    type: 'string',
    enum: [
        { 'BODY': BotBike.BODY },
        { 'HANDLEBAR': BotBike.HANDLEBAR },
        { 'RIDER': BotBike.RIDER }
    ]
});

// initialize code called once per entity
BotBike.prototype.initialize = function() {
    var partTag = this.bikePart,

        
        updateModel = function () {
            var modelTag = partTag == BotBike.RIDER ? tr.Storage.mission.boss : 'bike_' + BotBike.getBotBikeModelNumber(),
                modelAsset = this.app.assets.findByTag([modelTag, partTag])[0];
            
            this.entity.model.asset = modelAsset;
            this.entity.fire(tr.Events.MODEL_UPDATE);
        }.bind(this);
    
    this.on('enable', updateModel);
    
    updateModel();
};

BotBike.getBotBikeModelNumber = function () {
      switch (tr.Storage.mission.boss) {
        case tr.Keys.BOSSES.BOSS_1:
            return 4;
        case tr.Keys.BOSSES.BOSS_2:
            return 7;
        case tr.Keys.BOSSES.BOSS_3:
            return 10;
        case tr.Keys.BOSSES.SIDEBOSS:
            return 8;
    }
};

// animate-rotation.js
var AnimateRotation = pc.createScript('animateRotation');

AnimateRotation.attributes.add('axle', {
    type: 'string',
    title: 'Rotation axle',
    enum: [
        { 'x': 'x' },
        { 'y': 'y' },
        { 'z': 'z' }
    ]
});

AnimateRotation.attributes.add('rotationSpeed', {
    type: 'number',
    title: 'Rotation speed',
    default: 0.5
});

// initialize code called once per entity
AnimateRotation.prototype.initialize = function() {
    this.angles = { x: 0,
                    y: 0,
                    z: 0 };
};

// update code called every frame
AnimateRotation.prototype.update = function(dt) {    
    this.angles[this.axle] = (this.angles[this.axle] - this.rotationSpeed) % 360;
    
    this.entity.setLocalRotation(new pc.Quat().setFromEulerAngles(this.angles.x, this.angles.y, this.angles.z));
};


// hover.js
var Hover = pc.createScript('hover');

Hover.attributes.add('hoverTexture', { type: 'asset', assetType: 'texture' });

// initialize code called once per entity
Hover.prototype.initialize = function() {
    var onMouseEnter = function () {
            this.entity.element.texture = this.hoverTexture.resource;
        }.bind(this),
        
        onMouseLeave = function () {
            this.entity.element.textureAsset = this.freeTextureAsset;
        }.bind(this);
    
    this.freeTextureAsset = this.entity.element.textureAsset;
    
    this.entity.element.on('mouseenter', onMouseEnter);
    this.entity.element.on('mouseleave', onMouseLeave);
};


// tracer.js
var Tracer = pc.createScript('tracer'),
    
    MAX_VERTICES = 600, //150; //600;
    VERTEX_SIZE = 4;

Tracer.attributes.add("lifetime", {type:"number", default:0.5});
Tracer.attributes.add("xoffset", {type:"number", default:-0.8});
Tracer.attributes.add("yoffset", {type:"number", default:1});
Tracer.attributes.add("height", {type:"number", default:0.4});

Tracer.prototype.initialize = function () {
    this.timer = 0;

    // The node generating this ribbon
    this.node = this.entity;
    
    // The generated ribbon vertices
    this.vertices = [];

    // Vertex array to receive ribbon vertices
    this.vertexData = new Float32Array(MAX_VERTICES * VERTEX_SIZE);

    this.entity.model = null;
    
    var shaderDefinition = {
        attributes: {
            aPositionAge: pc.SEMANTIC_POSITION
        },
        vshader: [
            "attribute vec4 aPositionAge;",
            "",
            "uniform mat4 matrix_viewProjection;",
            "uniform float trail_time;",
            "",
            "varying float vAge;",
            "",
            "void main(void)",
            "{",
            "    vAge = trail_time - aPositionAge.w;",
            "    gl_Position = matrix_viewProjection * vec4(aPositionAge.xyz, 1.0);",
            "}"
        ].join("\n"),
        fshader: [
            "precision mediump float;",
            "",
            "varying float vAge;",
            "",
            "uniform float trail_lifetime;",
            "",
            "vec3 rainbow(float x)",
            "{",
                    "float level = floor(x * 6.0);",
                    "float r = float(level <= 2.0) + float(level > 4.0) * 0.5;",
                    "float g = max(1.0 - abs(level - 2.0) * 0.5, 0.0);",
                    "float b = (1.0 - (level - 4.0) * 0.5) * float(level >= 4.0);",
                    "return vec3(r, g, b);",
            "}",
            "void main(void)",
            "{",
            "    gl_FragColor = vec4(rainbow(vAge / trail_lifetime), (1.0 - (vAge / trail_lifetime)) * 0.5);",
            "}"
        ].join("\n")
    };
    
//    var shader = new pc.Shader(context.graphicsDevice, shaderDefinition);
    var shader = new pc.Shader(this.app.graphicsDevice, shaderDefinition);

    var material = new pc.scene.Material();
    material.setShader(shader);
    material.setParameter('trail_time', 0);
    material.setParameter('trail_lifetime', this.lifetime);
    material.cull = pc.CULLFACE_NONE;
    material.blend = true;
    material.blendSrc = pc.BLENDMODE_SRC_ALPHA;
    material.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
    material.blendEquation = pc.BLENDEQUATION_ADD;
    material.depthWrite = false;

    // Create the vertex format
    var vertexFormat = new pc.VertexFormat(this.app.context.graphicsDevice, [
        { semantic: pc.SEMANTIC_POSITION, components: 4, type: pc.ELEMENTTYPE_FLOAT32 }
    ]);

    // Create a vertex buffer
    var vertexBuffer = new pc.VertexBuffer(this.app.context.graphicsDevice, vertexFormat, 
                                           MAX_VERTICES * VERTEX_SIZE, pc.USAGE_DYNAMIC);

    var mesh = new pc.scene.Mesh();
    mesh.vertexBuffer = vertexBuffer;
    mesh.indexBuffer[0] = null;
    mesh.primitive[0].type = pc.PRIMITIVE_TRISTRIP;
    mesh.primitive[0].base = 0;
    mesh.primitive[0].count = 0;
    mesh.primitive[0].indexed = false;

    var node = new pc.scene.GraphNode();

    var meshInstance = new pc.scene.MeshInstance(node, mesh, material);
    meshInstance.layer = pc.scene.LAYER_WORLD;
    meshInstance.updateKey();

    this.entity.model = new pc.scene.Model();
    this.entity.model.graph = node;
    this.entity.model.meshInstances.push(meshInstance);

    this.model = this.entity.model;
};


Tracer.prototype.reset = function () {
    this.timer = 0;
    this.vertices = [];
};
        
Tracer.prototype.spawn = function () {
    var node = this.node;
    var pos = node.getPosition();
    var yaxis = node.up.clone().scale(this.height);

    var s = this.xoffset;
    var e = this.yoffset;
    this.vertices.unshift({
        spawnTime: this.timer,
        vertexPair: [
            pos.x + yaxis.x * s, pos.y + yaxis.y * s, pos.z + yaxis.z * s, 
            pos.x + yaxis.x * e, pos.y + yaxis.y * e, pos.z + yaxis.z * e
        ]
    });
};

Tracer.prototype.clearOld = function () {
    for (var i = this.vertices.length - 1; i >= 0; i--) {
        var vp = this.vertices[i];
        if (this.timer - vp.spawnTime >= this.lifetime) {
            this.vertices.pop();
        } else {
            return;
        }
    }
};
        
Tracer.prototype.copyToArrayBuffer = function () {
    for (var i = 0; i < this.vertices.length; i++) {
        var vp = this.vertices[i];

        this.vertexData[i * 8 + 0] = vp.vertexPair[0];
        this.vertexData[i * 8 + 1] = vp.vertexPair[1];
        this.vertexData[i * 8 + 2] = vp.vertexPair[2];
        this.vertexData[i * 8 + 3] = vp.spawnTime;

        this.vertexData[i * 8 + 4] = vp.vertexPair[3];
        this.vertexData[i * 8 + 5] = vp.vertexPair[4];
        this.vertexData[i * 8 + 6] = vp.vertexPair[5];
        this.vertexData[i * 8 + 7] = vp.spawnTime;
    }
};
        
Tracer.prototype.updateNumActive = function () {
    this.model.meshInstances[0].mesh.primitive[0].count = this.vertices.length * 2;
};

Tracer.prototype.update = function (dt) {
    this.timer += dt;
    var material = this.model.meshInstances[0].material;
    material.setParameter('trail_time', this.timer);

    this.clearOld();
    this.spawn();

    if (this.vertices.length > 1) {
        this.copyToArrayBuffer();
        this.updateNumActive();

        var vertexBuffer = this.model.meshInstances[0].mesh.vertexBuffer;
        var vertices = new Float32Array(vertexBuffer.lock());
        vertices.set(this.vertexData);
        vertexBuffer.unlock();

        if (!this.app.scene.containsModel(this.model)) {
            console.log("Added model");
            this.app.scene.addModel(this.model);
        }
    } else {
        if (this.app.scene.containsModel(this.model)) {
            console.log("Removed model");
            this.app.scene.removeModel(this.model);
        }
    }
};


// camera-path.js
var CameraPath = pc.createScript('cameraPath'),
    
    pathSchema = [{
        name: 'pathRoot',
        type: 'entity',
        title: "Path root entity"
    }, {
        name: 'duration',
        type: "number", 
        default: 10, 
        title: "Duration Secs"
    }, {
        name: 'delay',
        type: "number", 
        default: 0, 
        title: "Delayed start"
    }, {
        name: 'startTime',
        type: "number", 
        default: 0, 
        title: "Start Time (Secs)", 
        description: "Start the path from a specific point in time"
    }, {
        name: 'easeIn',
        type: "boolean", 
        default: true,
        description: "Ease on start"
    }, {
        name: 'easeOut',
        type: "boolean",
        default: true,
        description: "Ease on end"
    }];

CameraPath.attributes.add('pathList', {
    type: "json",
    array: true,
    schema: pathSchema
});

CameraPath.attributes.add('garageOnComplete', {
    type: "boolean",
    default: false
});

// initialize code called once per entity
CameraPath.prototype.initialize = function() {
    this.EASE_STEP = 0.01;
    this.ease = this.EASE_STEP;
    
    var onEnable = function () {
        this.pathNum = 0;
        this.complete = false;
        
        // Generate the camera path using pc.Curve: http://developer.playcanvas.com/en/api/pc.Curve.html
         this.initPath(this.pathList[this.pathNum]);
    }.bind(this);
    
    // Learn more about live attribute tweaking from this project: https://playcanvas.com/editor/scene/475560
    // If the user decides to change the path while the app is running, this allows for quicker iteration
    this.on("attr:pathList", function (value, prev) {
        if (value)
            onEnable();
    });
        
    // Caching some Vec3 objects that will be used in the update loop continously 
    // so we don't keep triggering the garbage collector
    this.lookAt = new pc.Vec3();
    this.up = new pc.Vec3();
    
    this.on("enable", onEnable);
    
    onEnable();
};

CameraPath.prototype.initPath = function (path) {
    this.path = path;
    this.time = pc.math.clamp(this.path.startTime, 0, this.path.duration);
    this.wait = !!this.path.delay;
    
    if (this.wait)
        this.entity.delayedCall(this.path.delay * 1000, function () {
            this.wait = false;
        }, this);
    
    var curveMode = pc.CURVE_CARDINAL;
    
    // Create curves for position
    this.px = new pc.Curve(); 
    this.px.type = curveMode;
    
    this.py = new pc.Curve(); 
    this.py.type = curveMode;    
    
    this.pz = new pc.Curve(); 
    this.pz.type = curveMode;
    
    // Create curves for target look at position
    this.tx = new pc.Curve();
    this.tx.type = curveMode;
    
    this.ty = new pc.Curve();
    this.ty.type = curveMode;
    
    this.tz = new pc.Curve();
    this.tz.type = curveMode;
    
    // Create curves for the 'up' vector for use with the lookAt function to 
    // allow for roll and avoid gimbal lock
    this.ux = new pc.Curve();
    this.ux.type = curveMode;
    
    this.uy = new pc.Curve();
    this.uy.type = curveMode;
    
    this.uz = new pc.Curve();
    this.uz.type = curveMode;
    
    var nodes = this.path.pathRoot.children;  
    
    // Get the total linear distance of the path (this isn't correct but gives a decent approximation in length)
    var pathLength = 0;
    
    // Store the distance from the start of the path for each path node
    var nodePathLength = [];
    
    // For use when calculating the distance between two nodes on the path
    var distanceBetween = new pc.Vec3();
    
    // Push 0 as we are starting our loop from 1 for ease
    nodePathLength.push(0);
    
    for (i = 1; i < nodes.length; i++) {
        var prevNode = nodes[i-1];
        var nextNode = nodes[i];
        
        // Work out the distance between the current node and the one before in the path
        distanceBetween.sub2(prevNode.getPosition(), nextNode.getPosition());
        pathLength += distanceBetween.length();
        
        nodePathLength.push(pathLength);
    }
        
    for (i = 0; i < nodes.length; i++) {
        // Calculate the time for the curve key based on the distance of the path to the node
        // and the total path length so the speed of the camera travel stays relatively
        // consistent throughout
        var t = nodePathLength[i] / pathLength;
        
        var node = nodes[i];
        
        var pos = node.getPosition();
        this.px.add(t, pos.x);
        this.py.add(t, pos.y);
        this.pz.add(t, pos.z);
        
        // Create and store a lookAt position based on the node position and the forward direction
        var lookAt = pos.clone().add(node.forward);
        this.tx.add(t, lookAt.x);
        this.ty.add(t, lookAt.y);
        this.tz.add(t, lookAt.z);
        
        var up = node.up;
        this.ux.add(t, up.x);
        this.uy.add(t, up.y);
        this.uz.add(t, up.z);
    }
    
    if (this.path.delay) {
        this.entity.setPosition(nodes[0].getPosition());
        this.entity.setEulerAngles(nodes[0].getEulerAngles());
    }
};

// update code called every frame
CameraPath.prototype.update = function(dt) {
    if (this.wait || this.complete)
        return;
    
    var percent;
        
    this.time += dt * this.ease;

    if (this.time > this.path.duration) {
        this.pathNum++;
        
        if (this.pathList[this.pathNum]) {
            this.initPath(this.pathList[this.pathNum]);
        } else {
            this.complete = true;
            
            if (this.garageOnComplete)
                this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GARAGE);
        }
        
        return;
    }

    // Work out how far we are in time we have progressed along the path
    percent = this.time / this.path.duration;
    
    if (percent < 0.1 && this.ease < 0.99 && this.path.easeIn)
        this.ease = Math.min(this.ease + this.EASE_STEP, 0.99);
    else if (percent > 0.9 && this.ease > 0.01 && this.path.easeOut)
        this.ease = Math.max(this.ease - this.EASE_STEP, 0.01);
    
    // Get the interpolated values for the position from the curves     
    this.entity.setPosition(this.px.value(percent), this.py.value(percent), this.pz.value(percent));
    
    // Get the interpolated values for the look at point from the curves 
    this.lookAt.set(this.tx.value(percent), this.ty.value(percent), this.tz.value(percent));
    
    // Get the interpolated values for the up vector from the curves     
    this.up.set(this.ux.value(percent), this.uy.value(percent), this.uz.value(percent));
    
    // Make the camera look at the interpolated target position with the correct
    // up direction to allow for camera roll and to avoid glimbal lock
    this.entity.lookAt(this.lookAt, this.up);
};

// showup.js
pc.extend(tr, function () {

    var Showup = function () {
        tr.Screen.call(this, tr.Keys.SCREENS.SHOWUP);
    };
    
    Showup = pc.inherits(Showup, tr.Screen);
    
    Showup.prototype.show = function () {
        var color = new pc.Color();
        color.fromString('#ACACAC');
        
        tr.Screen.prototype.show.call(this);
        
        pc.app.setSkybox(null);
        pc.app.scene.fogColor = color;
        pc.app.scene.ambientLight = color;
        
        tr.SoundController.play(tr.Keys.SOUNDS.BIKE_UNLOCK);
    };
    
    Showup.prototype.hide = function () {
        return new Promise(function (res, rej) {
            tr.Screen.prototype.hide.call(this).then(res);
        }.bind(this));
    };
    
    return {
        Showup: Showup
    };
    
}());

// prevent-user-select.js
var PreventUserSelect = pc.createScript('preventUserSelect');

PreventUserSelect.attributes.add('css', {type: 'asset', assetType:'css', title: 'CSS Asset'});

// initialize code called once per entity
PreventUserSelect.prototype.initialize = function() {
    var style = document.createElement('style');
    document.head.appendChild(style);
    style.innerHTML = this.css.resource || '';
    
    document.body.classList.add("prevent-user-select");
};

// bike-specs.js
var BikeSpecs = pc.createScript('bikeSpecs');

BikeSpecs.attributes.add('riderPosition', {
    type: 'vec2',
    description: 'Rider position in landscape'
});

BikeSpecs.attributes.add('riderPositionPort', {
    type: 'vec2',
    description: 'Rider position in portrait'
});

BikeSpecs.attributes.add('riderMovementFactor', {
    type: 'vec2',
    description: 'Rider movement factor'
});

BikeSpecs.attributes.add('camPitchLand', {
    type: 'number',
    default: 0,
    description: 'Camera x euler angle in landscape'
});

BikeSpecs.attributes.add('camPitchPort', {
    type: 'number',
    default: 19,
    description: 'Camera x euler angle in portrait'
});

BikeSpecs.attributes.add('camTiltFactor', {
    type: 'number',
    default: 1,
    description: 'Camera z euler angle factor'
});

BikeSpecs.attributes.add('camTiltToHangRatio', {
    type: 'number',
    default: 55,
    description: 'Defines how much camera tilt affects camera x position (rider hanging)'
});

BikeSpecs.attributes.add('bikeTiltRatio', {
    type: 'number',
    default: 0.64,
    description: 'Bike tilt ratio'
});

BikeSpecs.attributes.add('bikeTurnRatio', {
    type: 'number',
    default: 0.5,
    description: 'Bike turning ratio'
});

BikeSpecs.attributes.add('tiltAngle', {
    type: 'number',
    default: 8,
    description: 'Head tilt max angle'
});

BikeSpecs.attributes.add('tiltSpeed', {
    type: 'number',
    default: 60,
    description: 'Head tilt speed'
});

BikeSpecs.attributes.add('maxSpeed', {
    type: 'json',
    schema: [{
        name: '0',
        type: 'number',
        title: 'Level1',
        description: 'Bike speed limit for level1'
    }, {
        name: '1',
        type: 'number',
        title: 'Level2',
        description: 'Bike speed limit for level2'
    }, {
        name: '2',
        type: 'number',
        title: 'Level3',
        description: 'Bike speed limit for level3'
    }, {
        name: '3',
        type: 'number',
        title: 'Level4',
        description: 'Bike speed limit for level4'
    }]
});

BikeSpecs.attributes.add('acceleration', {
    type: 'number',
    default: 7,
    description: 'acceleration ratio'
});

BikeSpecs.attributes.add('handling', {
    type: 'number',
    default: 105,
    description: 'Z speed ratio. Defines left/right movement speed'
});

BikeSpecs.attributes.add('breaking', {
    type: 'number',
    default: 9,
    description: 'breaking ratio'
});

BikeSpecs.attributes.add('handlebarAngle', {
    type: 'number',
    default: 10,
    description: 'Handlebar rotation angle'
});

BikeSpecs.attributes.add('handlebarSpeed', {
    type: 'number',
    default: 260,
    description: 'Handlebar rotation speed'
});

BikeSpecs.attributes.add('handlingSpeedIncrease', {
    type: 'number',
    default: 1,
    description: 'Defines how handlebar rotation speed should increase over bike speed'
});

BikeSpecs.attributes.add('tempoPinAngles', {
    type: 'number',
    description: 'Tempo pin angles'
});

BikeSpecs.attributes.add('sound', {
    type: 'string',
    enum: [{ 'SCOOTER': 'Scooter' },
           { 'CHOPPER': 'Chopper' },
           { 'DIRT': 'Dirt' },
           { 'STREET': 'Street' },
           { 'SPORT': 'Sport' }],
    description: 'Sound name'
});

BikeSpecs.attributes.add('gears', {
    type: 'number',
    default: 1,
    description: 'Gears number'
});

BikeSpecs.attributes.add('colliderScale', {
    type: 'number',
    default: 1,
    description: 'By default collider has with of handlebar. It can be scaled up/down'
});

BikeSpecs.attributes.add('overtakeScale', {
    type: 'number',
    default: 1,
    description: 'Intended to make overtakes easier (if grater than 1)'
});

BikeSpecs.attributes.add('cost', {
    type: 'number',
    description: 'Bike cost'
});

BikeSpecs.attributes.add('upgradeCost', {
    type: 'json',
    schema: [{
        name: '0',
        type: 'number',
        title: 'Level2',
        description: 'Bike upgrade cost for level2'
    }, {
        name: '1',
        type: 'number',
        title: 'Level3',
        description: 'Bike speed limit for level3'
    }, {
        name: '2',
        type: 'number',
        title: 'Level4',
        description: 'Bike speed limit for level4'
    }]
});

Object.defineProperty(BikeSpecs.prototype, "shiftRatios", {
    get: function() {
        if (this._shiftRatios)
            return this._shiftRatios;
        
        this._shiftRatios = [0];
        
        for (var i = 1; i <= this.gears; i++) {
            this._shiftRatios.push(i / this.gears + 0.01);
        }
        
        return this._shiftRatios;
    }
});

/* listen to attribute change event in editor */
BikeSpecs.prototype.initialize = function() {
    this.on('attr', function(attributeName, value, prevValue) {
        this.app.fire(tr.Events.Debug.BIKE_ATTRIBUTE_CHANGED, attributeName, value);
    });
};

// traffic-controller.js
var TrafficController = pc.createScript('trafficController');

TrafficController.attributes.add('player', {
    type: 'entity',
    description: 'The player'
});

TrafficController.attributes.add('kinematic', {
    type: 'boolean',
    default: true,
    description: 'Use kinematic vehicles'
});

// initialize code called once per entity
TrafficController.prototype.postInitialize = function() {
    this.OVERTAKE_END_DIST = 5;
    this.MIN_OVERTAKE_SPEED = tr.Config.OVERTAKE_SPEED;
    this.SPAWN_DIST = 300;
    this.MIN_DIST = tr.Config.MIN_CAR_DIST;
    this.DESPAWN_X = [1, 325];
    this.LANE_HALF_WIDTH = tr.Config.LANES_Z[1];
    this.MIN_INTERVAL = 0.12;
    this.MAX_CARS_AT_START = 5;
    this.LANE_CHANGING_SPEED = 1;
    this.cars = [];
    this.combo = 0;
    this.timeSinceCombo = 0;
    
    this.carTemplate = this.kinematic ? this.app.assets.find('Kinematic Car', 'template') :
        this.app.assets.find('Car', 'template');
    
    this.acceleration = tr.Storage.acceleration;
    
    var onEnable = function () {
            this.overtake_int = tr.Storage.level < 4 ? tr.Config.OVERTAKE_INT_TUTORIAL : tr.Config.OVERTAKE_INT;
            this.avg_speed = tr.Storage.getMaxSpeed() * tr.Storage.mission.avgSpeedRatio;
            
            var initCarsNum = tr.Utils.getRandomInt(2, this.MAX_CARS_AT_START),
                initMinSpawnDist = 50 + tr.Storage.selectedBike * 5,
                direction = !tr.Storage.getTwoWay() ? 1 : -1,
                i;
            
            for (i = this.cars.length - 1; i >= 0; i--) {
                this.despawn(i);
            }

            this.carIds = [];
            this.v1 = this.acceleration.velocity;
            this.lanes = [new tr.Lane(0, 1), new tr.Lane(1, 1), new tr.Lane(2, direction), new tr.Lane(3, direction)];
            this.carNumber = tr.Storage.mission ? tr.Storage.mission.carsNumber : 20;

            if (tr.Storage.level == 3) {
                this.spawn(40, 1);
                this.spawn(50, 1);
            } else {
                for (i = this.MAX_CARS_AT_START - initCarsNum; i < this.MAX_CARS_AT_START; i++) {
                    this.spawn(initMinSpawnDist + this.MIN_DIST * i, tr.Utils.getRandomInt(0, this.lanes.length - 1));
                }
            }
            
            this.resetLaneChanging();
        }.bind(this);
    
    this.on('enable', onEnable);
    
    this.on('destroy', function () {
        
    }.bind(this));
    
    onEnable();
};

TrafficController.prototype.resetLaneChanging = function () {
    this.laneChangeInt = tr.Utils.getRandomInt(1, 2);
    this.timeSinceLaneChange = 0;
    
    if (!this.laneChanging)
        return;
    
    this.laneChanging.car.turnStop();
    this.laneChanging.car.dynamics.linearVelocity.z = 0;
    this.laneChanging.originLane.remove(this.laneChanging.car);
    this.laneChanging = null;
};

TrafficController.prototype.doLaneChanging = function () {
    var car = tr.Utils.getRandomValue(this.cars),
        playerPos = this.player.getPosition(),
        carPos = car.entity.getPosition(),
        changeDir = tr.Utils.getRandomValue([-1, 1]),
        originLane = this.lanes[car.laneIndex],
        targetLane,
        carIndex;
    
    if (tr.Utils.isOutOfRange(playerPos.x + 20, playerPos.x + 120, carPos.x) || tr.Storage.level == 3) {
        this.resetLaneChanging();
        return;
    }
    
    //check nearby lane
    targetLane = this.lanes[car.laneIndex + changeDir];
    
    if (!targetLane || originLane.direction + targetLane.direction === 0) {
        changeDir *= -1;
        targetLane = this.lanes[car.laneIndex + changeDir];
    }
    
    carIndex = targetLane.checkFreeSpace(carPos.x);
    
    if (carIndex === false) {
        this.resetLaneChanging();
        return;
    }
    
    this.laneChanging = { car: car, originLane: originLane, targetLane: targetLane };
    targetLane.pushAt(car, carIndex);
    car.laneIndex = targetLane.index;
    car.dynamics.linearVelocity.z = this.LANE_CHANGING_SPEED * changeDir * -1;
    car.turnStart(changeDir * -1);
    car.generateZDeviation();
};

TrafficController.prototype.spawn = function(spawnDist, laneIndex) {
    if (this.cars.length >= this.carNumber)
        return;
    
    var laneZ = this.lanes[laneIndex].z,
        direction =  this.lanes[laneIndex].direction,
        playerPos = this.player.getPosition(),
        newCar = new tr.Car(this.carTemplate, laneIndex, direction),
        newCarPos = newCar.entity.getPosition(),
        sDist = spawnDist || this.SPAWN_DIST,
        spawnPos = new pc.Vec3(playerPos.x + sDist, newCarPos.y, laneZ),
        spawnQuat = new pc.Quat(),
        velocity = tr.Storage.gameMode == tr.Keys.GAME_MODES.RACE ? this.avg_speed : 
            this.avg_speed * tr.Utils.getRandomNumber(1 - tr.Storage.mission.speedDev, 1 + tr.Storage.mission.speedDev),
        laneGap;
    
    if (direction < 0) velocity *= tr.Storage.mission.oppLaneSpeedRatio;
    
    spawnQuat.setFromAxisAngle(pc.Vec3.UP, 180 * Number(direction < 0));
    
    this.lanes[laneIndex].push(newCar);
    this.cars.push(newCar);
    this.entity.addChild(newCar.entity);
    
    newCar.laneIndex = laneIndex;
    newCar.entity.enabled = true;
    
    laneGap = Math.max(0, this.LANE_HALF_WIDTH - this.MIN_INTERVAL - newCar.entity.collision.halfExtents.z);
    newCar.setLaneGap(laneGap);
    spawnPos.z += newCar.zDeviation;
    
    if (this.kinematic) {
        newCar.entity.setPosition(spawnPos);
        newCar.entity.setRotation(spawnQuat);
    } else {
        newCar.entity.rigidbody.teleport(spawnPos, spawnQuat);
    }
    
    newCar.dynamics.linearVelocity = new pc.Vec3(tr.Utils.kmhToMs(velocity) * direction - 
                                                  this.acceleration.velocity, 0, 0);
    
    //console.log('spawn' + this.cars.length);
};

TrafficController.prototype.despawn = function(index) {
    var car = this.cars[index];
    
    if (this.laneChanging && this.laneChanging.car == car)
        this.resetLaneChanging();
    
    this.lanes[car.laneIndex].remove(car);
    this.cars.splice(index, 1);
    this.entity.removeChild(car.entity);
    car.entity.destroy();
    car = null;
    
    //console.log('despawn');
};

// update code called every frame
TrafficController.prototype.update = function(dt) {
    if (!dt)
        return;
    
    var playerPos = this.player.getPosition(),
        dist = Math.floor(tr.Storage.distance),
        dv = this.acceleration.velocity - this.v1,
        spawnedCars = 0,
        overtakeDist,
        carIdInd,
        carPos,
        carDist;
    
    this.timeSinceCombo += dt;
    
    if (this.timeSinceCombo > tr.Config.COMBO_INT)
        this.combo = 0;
    
    this.lanes.forEach(function (lane, index) {
        var lastCar = lane.getLastCar(),
            firstCar = lane.getFirstCar(),
            spawnCheckDist = lane.direction > 0 ? tr.Storage.mission.cooldownDist : tr.Storage.mission.cooldownDistOpp,
            spawnProb = lane.direction > 0 ? tr.Storage.mission.spawnProb : tr.Storage.mission.spawnProbOpp,
            carA,
            carB,
            followingCar,
            leadingCar,
            followingCarVel,
            carAVel,
            compFunc,
            i;
        
        if (lastCar)
            lastCar.spawnPointDist += (this.acceleration.velocity + lastCar.dynamics.linearVelocity.x) * dt;
        
        lane.playerSpawnCheckDist += this.acceleration.velocity * dt;
        
        for (i = 0; i < lane.cars.length - 1; i++) {
            carA = lane.cars[i];
            carB = lane.cars[i + 1];
            followingCar = lane.direction > 0 ? carA : carB;
            leadingCar = lane.direction < 0 ? carA : carB;
            compFunc = lane.direction < 0 ? Math.min : Math.max;
            
            //break to avoid crash
            if (carA.entity.getPosition().distance(carB.entity.getPosition()) <= this.MIN_DIST && 
                    carA.dynamics.linearVelocity.x > carB.dynamics.linearVelocity.x) {
                
                followingCarVel = followingCar.dynamics.linearVelocity.clone();
                followingCarVel.x = compFunc(Math.min(leadingCar.dynamics.linearVelocity.x, -this.acceleration.velocity), 
                                             followingCarVel.x + (-0.02 * Math.abs(followingCarVel.x) * lane.direction));
                followingCar.dynamics.linearVelocity = followingCarVel;
                followingCar.break();
            }
            
            //handicap
            if (lane.direction > 0 && firstCar && (firstCar.entity.getPosition().x + playerPos.x > 100) && 
                carA.dynamics.linearVelocity.x > 0) {
                if (!carA.handicapSpeed)
                    carA.handicapSpeed = (carA.dynamics.linearVelocity.x - this.acceleration.velocity) / 2;
                
                if (carA.dynamics.linearVelocity.x > carA.handicapSpeed) {
                    carAVel = carA.dynamics.linearVelocity.clone();
                    carAVel.x += (-0.01 * Math.abs(carAVel.x));
                    
                    carA.dynamics.linearVelocity = carAVel;
                    carA.break();
                }
            }
        }
        
        if (lane.playerSpawnCheckDist - (lastCar ? lastCar.spawnPointDist : 0) >= spawnCheckDist) {
            if (tr.Utils.throwDice(spawnProb) && spawnedCars < tr.Storage.mission.spawnNumber) {
                this.spawn(0, index);
                spawnedCars++;
            } else {
                if (lastCar)
                    lastCar.spawnPointDist = 0;
                
                lane.playerSpawnCheckDist = 0;
            }
        }
    }.bind(this));
        
    this.cars.forEach(function (car, index) {
        var vel = car.dynamics.linearVelocity.clone();
        
        overtakeDist = car.entity.collision.halfExtents.z + 
            tr.Storage.selectedBikeSpecs.overtakeScale * this.player.collision.height / 
            tr.Storage.selectedBikeSpecs.colliderScale + this.overtake_int;
        
        vel.x += -dv - ((this.acceleration.velocity + car.dynamics.linearVelocity.x) * car.dynamics.angularDamping * dt);
        vel.z *= 1 - car.dynamics.angularDamping * dt;
        car.dynamics.linearVelocity = vel;
        
        carPos = car.entity.getPosition();
        carDist = carPos.distance(playerPos);
        
        if (tr.Utils.isOutOfRange(this.DESPAWN_X[0], this.DESPAWN_X[1], carPos.x))
            this.despawn(index);
        
        carIdInd = this.carIds.indexOf(car.entity._guid);
        
        //detect overtake
        if (carDist <= overtakeDist && carIdInd < 0 && this.acceleration.velocity >= this.MIN_OVERTAKE_SPEED) {
            tr.Storage.overtakes++;
            
            tr.SoundController.play(tr.Keys.SOUNDS.CAR_OVERTAKE);
            
            this.timeSinceCombo = 0;
            this.combo = this.combo + 1;
            tr.Storage.maxCombo = Math.max(tr.Storage.maxCombo, this.combo);
            this.app.fire(tr.Events.PLAYER_OVERTAKE, car.entity, this.combo, playerPos.z > carPos.z);
            this.carIds.push(car.entity._guid);
        } else if (carIdInd >= 0 && carDist >= this.OVERTAKE_END_DIST) {
            this.carIds.slice(carIdInd, 1);
        }
    }.bind(this));
    
    //lane changing
    this.timeSinceLaneChange += dt;
    
    if (this.timeSinceLaneChange >= this.laneChangeInt && !this.laneChanging && this.cars.length) {
        this.doLaneChanging();
    } else if (this.laneChanging && ((this.laneChanging.car.dynamics.linearVelocity.z < 0 && 
                                    this.laneChanging.car.entity.getPosition().z <= 
                                    this.laneChanging.targetLane.z + this.laneChanging.car.zDeviation) ||
                                  (this.laneChanging.car.dynamics.linearVelocity.z > 0 && 
                                   this.laneChanging.car.entity.getPosition().z >= 
                                   this.laneChanging.targetLane.z + this.laneChanging.car.zDeviation))) {
        this.resetLaneChanging();
    }
    
    this.v1 = this.acceleration.velocity;
};


// car-dynamics.js
var CarDynamics = pc.createScript('carDynamics');

// initialize code called once per entity
CarDynamics.prototype.initialize = function() {
    
};

Object.defineProperty(CarDynamics.prototype, "linearVelocity", {
    get: function() {
        if (this._linearVelocity)
            return this._linearVelocity;

        this._linearVelocity = pc.Vec3.ZERO.clone();

        return this._linearVelocity;
    },

    set: function(val) {
        if (this._linearVelocity)
            this._linearVelocity.copy(val);
        else
            this._linearVelocity = val.clone();
    }
});

Object.defineProperty(CarDynamics.prototype, "angularDamping", {
    get: function() {
        return this._angularDamping || 0;
    },

    set: function(val) {
        this._angularDamping = val;
    }
});

// update code called every frame
CarDynamics.prototype.update = function(dt) {
    var pos = this.entity.getPosition();
    pos.add(this.linearVelocity.clone().scale(dt));
    this.entity.setPosition(pos);
};


// vehicle.js
var Vehicle = pc.createScript('vehicle');

Vehicle.attributes.add('model', {
    type: 'entity',
    description: 'The model'
});

// initialize code called once per entity
Vehicle.prototype.initialize = function() {
    var vehicles = this.app.assets.findByTag('vehicle'),
        halfExtentsDefault = this.entity.collision.halfExtents,
        vehicleTemplate = tr.Utils.getRandomValue(vehicles),
        blobContainer,
        vehicle,
        aabb,
        tyre;
    
    vehicle = vehicleTemplate.resource.instantiate();
    this.model.addChild(vehicle);
    
    vehicle.enabled = true;
    
    blobContainer = vehicle.findByName('BlobContainer');
    if (blobContainer) blobContainer.enabled = tr.Storage.nightMode;
    
    this.rearLights = vehicle.findByName('RearLights');
    if (this.rearLights) this.rearLights.enabled = tr.Storage.nightMode;
    
    this.turnLightLeft = vehicle.findByName('TurnLightLeft');
    if (this.turnLightLeft) this.turnLightLeft.enabled = false;
    
    this.turnLightRight = vehicle.findByName('TurnLightRight');
    if (this.turnLightRight) this.turnLightRight.enabled = false;
    
    if (this.rearLights) {
        this.stopOpacity = this.rearLights.findByName('Blob').script.blobLight.opacity;
        this.setParkingLights();
    }
    this.acceleration = tr.Storage.acceleration;
    
    aabb = tr.Utils.getAABB(vehicle);
    
    this.entity.collision.halfExtents = new pc.Vec3(aabb.halfExtents.x, halfExtentsDefault.y, aabb.halfExtents.z - 0.1);
    //this.entity.collision.height = aabb.halfExtents.x * 2;
    //this.entity.collision.radius = aabb.halfExtents.z;
    
    this.wheels = vehicle.model.model.graph.find(function (node) {
            return node.name.toLowerCase().indexOf('wheel') >= 0;
        });
    
    tyre = vehicle.model.model.meshInstances.find(function (meshInstance) {
            return meshInstance.material.name.toLowerCase().indexOf('tires') >= 0;
        });
    
    this.circumference = 2 * Math.PI * tyre.aabb.halfExtents.x;
    this.degC = this.circumference / 360;
    this.quatA = new pc.Vec3();
    
    this.entity.rigidbody.on('collisionstart', function (e) {
          // if (e.other.name != 'Player' || !tr.Config.PARAMETERS.CRASH)
          //     return;

        this.entity.dynamics.angularDamping = 0.9;
    }.bind(this));
};

Vehicle.prototype.startTurnLights = function(side) {
    this.turning = side;
    this.turnLightsTimer = 0;
};

Vehicle.prototype.stopTurnLights = function() {
    this.updateTurnLights(true);
    this.turning = 0;
};

Vehicle.prototype.breakLights = function() {
    this.breakingTimer = 1.5;
};

Vehicle.prototype.setParkingLights = function() {
    this.rearLights.children.forEach(function (child, index) {
            child.script.blobLight.opacity = this.stopOpacity * 0.7;
        }.bind(this));
};

Vehicle.prototype.updateTurnLights = function(disable) {
    var turnLights = this.turning > 0 ? this.turnLightRight : this.turnLightLeft;
    
    if (!turnLights)
        return;
    
    turnLights.enabled = disable === true ? false : Math.ceil(this.turnLightsTimer) % 2;
};

// update code called every frame
Vehicle.prototype.update = function(dt) {
    var quat = this.entity.getRotation(),
        eulY = quat.getAxisAngle(this.quatA),
        velocity = this.entity.dynamics.linearVelocity.x + this.acceleration.velocity,
        angle = (velocity / this.degC) * Math.cos(eulY * tr.Utils.DEG_TO_RAD) * dt;
    
    this.wheels.forEach(function (wheel, index) {
        wheel.rotateLocal(angle, 0, 0);
    });
    
    if (this.breakingTimer && !this.breakLightsActive && this.rearLights) {
        this.breakLightsActive = true;
        
        this.rearLights.enabled = true;
        this.rearLights.children.forEach(function (child, index) {
            child.script.blobLight.opacity = this.stopOpacity;
        }.bind(this));
    } else if (this.rearLights && this.breakLightsActive && !this.breakingTimer) {
        this.rearLights.enabled = tr.Storage.nightMode;
        this.setParkingLights();
    }
    
    this.breakingTimer = Math.max(0, this.breakingTimer - dt);
    
    if (this.turning) {
        this.turnLightsTimer += dt * 2;
        this.updateTurnLights();
    }
};

// animate-position.js
var AnimatePosition = pc.createScript('animatePosition');

// Example of creating curve attribute with multiple curves (in this case, x, y, z)
AnimatePosition.attributes.add("offsetCurve", {type: "curve", title: "Offset Curve", curves: [ 'x', 'y', 'z' ]});
AnimatePosition.attributes.add("duration", {type: "number", default: 3, title: "Duration (secs)"});


// initialize code called once per entity
AnimatePosition.prototype.initialize = function() {
    // Store the original position of the entity so we can offset from it
    this.startPosition = this.entity.getLocalPosition().clone();
    
    // Keep track of the current position
    this.position = new pc.Vec3();
    
    this.time = 0;
};


// update code called every frame
AnimatePosition.prototype.update = function(dt) {
    this.time += dt;
    
    // Loop the animation forever
    if (this.time > this.duration) {
        this.time -= this.duration;
    }
    
    // Calculate how far in time we are for the animation
    this.percent = this.time / this.duration;
    
    // Get curve values using current time relative to duration (percent)
    // The offsetCurve has 3 curves (x, y, z) so the returned value will be a set of 
    // 3 values
    this.curveValue = this.offsetCurve.value(this.percent);
    
    // Create our new position from the startPosition and curveValue
    this.position.copy(this.startPosition);
    this.position.x += this.curveValue[0];
    this.position.y += this.curveValue[1];
    this.position.z += this.curveValue[2];
    
    this.entity.setLocalPosition(this.position);
};


// bomb.js
var Bomb = pc.createScript('bomb');

// initialize code called once per entity
Bomb.prototype.initialize = function() {    
    // Find all the entity references we need for the effect as a whole
    this.light = this.entity.findByName("PointLight");
    this.explosion = this.entity.findByName("Explosion");
    this.mainVfx = this.entity.findByName("ExplosionFire").particlesystem;
    this.smokeVfx = this.entity.findByName("ExplosionSmoke").particlesystem;
    this.derbisVfx = this.entity.findByName("ExplosionDebris").particlesystem;
    this.model = this.entity.findByName("Model");
    this.player = this.entity.parent.findByName("Player");
    this.shine = this.entity.findByName("RedBeamGroup");
    this.acceleration = tr.Storage.acceleration;

    this.topologyYSlope = this.app.graphicsDevice.scope.resolve("topologyYSlope");
    this.topologyZSlope = this.app.graphicsDevice.scope.resolve("topologyZSlope");
    
    this.timeSinceExploded = 0;
    this.isExploded = false;
    
    this.explosion.translate(3, 0.5, 0);
};

// update code called every frame
Bomb.prototype.update = function(dt) {
    var pos = this.entity.getPosition(),
        playerPos = this.player.getPosition(),
        vOffset = Math.pow(pos.x, 2);
    
    pos.x -= this.acceleration.velocity * dt;
    
    this.entity.setPosition(pos);
    
    if (this.isExploded) {
        this.timeSinceExploded += dt;
        
        if (this.timeSinceExploded > 0.5) {
            if (this.light.enabled) {
                this.light.enabled = false;
            }
        }
    } else if (pos.distance(playerPos) < 1 && tr.Storage.gameState == tr.Keys.GAME_STATES.ACTIVE) {
        this.explode();
    }
    
    this.shine.setPosition(pos.x, 
                           pos.y + this.topologyYSlope.getValue() * vOffset, 
                           pos.z + this.topologyZSlope.getValue() * vOffset);
};

Bomb.prototype.explode = function () {
    this.timeSinceExploded = 0;
    this.isExploded = true;
    this.light.enabled = true;
    this.model.enabled = false;

    this.mainVfx.reset();
    this.mainVfx.play();

    this.smokeVfx.reset();
    this.smokeVfx.play();

    this.derbisVfx.reset();
    this.derbisVfx.play();     
    
    tr.SoundController.play(tr.Keys.SOUNDS.EXPLOSION);
    
    this.app.fire(tr.Events.CAMERA_SHAKE);
    this.app.fire(tr.Events.BOMB_EXPLOSION);
};

// coin.js
var Coin = pc.createScript('coin');

// initialize code called once per entity
Coin.prototype.initialize = function() {
    this.COLLECT_DISTANCE = 1.75;
    
    this.player = this.entity.parent.findByName("Player");
    this.model = this.entity.findByName("Model");
    this.shine = this.entity.findByName("PowerUpLongDistanceShine");
    this.acceleration = tr.Storage.acceleration;
    
    this.topologyYSlope = this.app.graphicsDevice.scope.resolve("topologyYSlope");
    this.topologyZSlope = this.app.graphicsDevice.scope.resolve("topologyZSlope");
    
    this.isCollected = false;
};

// update code called every frame
Coin.prototype.update = function(dt) {
    var pos = this.entity.getPosition(),
        playerPos = this.player.getPosition(),
        vOffset = Math.pow(pos.x, 2);
    
    pos.x -= this.acceleration.velocity * dt;
    
    this.entity.setPosition(pos);
    
    if (!this.isCollected && pos.distance(playerPos) < this.COLLECT_DISTANCE) {
        this.collect();
    }   

    this.shine.setPosition(pos.x, 
                           pos.y + this.topologyYSlope.getValue() * vOffset, 
                           pos.z + this.topologyZSlope.getValue() * vOffset);
};

Coin.prototype.collect = function () {
    tr.Storage.coins++;
    
    this.isCollected = true;

    this.model.enabled = false;  
    
    tr.SoundController.play(tr.Keys.SOUNDS.WRENCH_COLLECT);
    this.app.fire(tr.Events.COIN_COLLECTED, this.entity);
    this.entity.fire(tr.Events.COIN_COLLECTED);
    
    if (tr.Storage.coins == tr.Storage.mission.coinsNumber) {
        tr.Storage.gameState = tr.Keys.GAME_STATES.PASSED;

        this.app.fire(tr.Events.GAME_OVER);
    }      
};

// weather-controller.js
var WeatherController = pc.createScript('weatherController');

WeatherController.attributes.add('light', {
    type: 'entity',
    description: 'Day light entity'
});

WeatherController.attributes.add('exposureDay', {
    type: 'number',
    default: 1,
    description: 'Day exposure'
});

WeatherController.attributes.add('highway', {
    type: 'json',
    schema: [{
        name: 'cubemap',
        type: 'asset',
        assetType: 'cubemap',
        title: 'Skybox cubemap'
    }, {
        name: 'cubemapNight',
        type: 'asset',
        assetType: 'cubemap',
        title: 'Skybox night cubemap'
    }, {
        name: 'lightNight',
        type: 'entity',
        title: 'Night light source'
    }, {
        name: 'exposureNight',
        type: 'number',
        title: 'Night exposure',
        default: 0.7
    }, {
        name: 'fogStart',
        type: 'number',
        title: 'Fog distance start',
        default: 200
    }, {
        name: 'fogEnd',
        type: 'number',
        title: 'Fog distance end',
        default: 400
    }, {
        name: 'fogColor',
        type: 'rgb',
        title: 'Fog color'
    }, {
        name: 'fogColorNight',
        type: 'rgb',
        title: 'Fog night color'
    }, {
        name: 'ambientColor',
        type: 'rgb',
        title: 'Ambient color'
    }, {
        name: 'ambientColorNight',
        type: 'rgb',
        title: 'Ambient night color'
    }]
});

WeatherController.attributes.add('roadside', {
    type: 'json',
    schema: [{
        name: 'cubemap',
        type: 'asset',
        assetType: 'cubemap',
        title: 'Skybox cubemap'
    }, {
        name: 'cubemapNight',
        type: 'asset',
        assetType: 'cubemap',
        title: 'Skybox night cubemap'
    }, {
        name: 'lightNight',
        type: 'entity',
        title: 'Night light source'
    }, {
        name: 'exposureNight',
        type: 'number',
        title: 'Night exposure',
        default: 0.7
    }, {
        name: 'fogStart',
        type: 'number',
        title: 'Fog distance start',
        default: 200
    }, {
        name: 'fogEnd',
        type: 'number',
        title: 'Fog distance end',
        default: 400
    }, {
        name: 'fogColor',
        type: 'rgb',
        title: 'Fog color'
    },  {
        name: 'fogColorNight',
        type: 'rgb',
        title: 'Fog night color'
    }, {
        name: 'ambientColor',
        type: 'rgb',
        title: 'Ambient color'
    }, {
        name: 'ambientColorNight',
        type: 'rgb',
        title: 'Ambient night color'
    }]
});

WeatherController.attributes.add('route66', {
    type: 'json',
    schema: [{
        name: 'cubemap',
        type: 'asset',
        assetType: 'cubemap',
        title: 'Skybox cubemap'
    }, {
        name: 'cubemapNight',
        type: 'asset',
        assetType: 'cubemap',
        title: 'Skybox night cubemap'
    }, {
        name: 'lightNight',
        type: 'entity',
        title: 'Night light source'
    }, {
        name: 'exposureNight',
        type: 'number',
        title: 'Night exposure',
        default: 0.7
    }, {
        name: 'fogStart',
        type: 'number',
        title: 'Fog distance start',
        default: 200
    }, {
        name: 'fogEnd',
        type: 'number',
        title: 'Fog distance end',
        default: 400
    }, {
        name: 'fogColor',
        type: 'rgb',
        title: 'Fog color'
    },  {
        name: 'fogColorNight',
        type: 'rgb',
        title: 'Fog night color'
    }, {
        name: 'ambientColor',
        type: 'rgb',
        title: 'Ambient color'
    }, {
        name: 'ambientColorNight',
        type: 'rgb',
        title: 'Ambient night color'
    }]
});

WeatherController.attributes.add('shader', {
    type: 'json',
    schema: [{
        name: 'useFogShader',
        type: 'boolean',
        default: true,
        title: 'Use fog shader'
    }, {
        name: 'fogFShader',
        type: 'asset',
        assetType: 'shader',
        title: 'Fog shader asset'
    }, {
        name: 'fogStart',
        type: 'number',
        title: 'Shader fog distance start',
        default: 200
    }, {
        name: 'fogEnd',
        type: 'number',
        title: 'Shader fog distance end',
        default: 400
    }]
});

// initialize code called once per entity
WeatherController.prototype.initialize = function() {
    var sceneParams = { skyboxRotation: this.app.scene.skyboxRotation,
                        fogStart: this.app.scene.fogStart,
                        fogEnd: this.app.scene.fogEnd,
                        fogColor: this.app.scene.fogColor,
                        ambientLight: this.app.scene.ambientLight,
                        exposure: this.app.scene.exposure },
        blendedMaterials = [],
        
        onEnable = function () {
            var config = this[tr.Storage.gameArea],
                shaderConfig = this.shader,
                gd = this.app.graphicsDevice,
                nightMode = tr.Storage.nightMode,
                headlight = tr.Storage.selectedBikeEntity.findByTag('headlight')[0],
                fogFShader,
                material,

                assets = this.app.assets.filter(function (asset) {
                    return asset.type === 'material';
                });

            this.app.setSkybox(nightMode ? config.cubemapNight : config.cubemap);
            
            /* TODO remove this temporal patch that fixes rotated skybox faced once it's fixed by playcanvas devs */
            var rot = new pc.Quat();
            rot.setFromEulerAngles(180, 0, 0);
            this.app.scene.skyboxRotation = rot;

            this.app.scene.fogStart = config.fogStart;
            this.app.scene.fogEnd = config.fogEnd;
            this.app.scene.fogColor = nightMode ? config.fogColorNight : config.fogColor;
            this.app.scene.ambientLight = nightMode ? config.ambientColorNight : config.ambientColor;
            this.app.scene.exposure = nightMode ? config.exposureNight : this.exposureDay;

            if (config.lightNight)
                config.lightNight.enabled = nightMode;
            
            this.light.enabled = !nightMode;
            headlight.enabled = nightMode;

            // Custom fog shader starts here
            // dynamically set the precision depending on device.
            fogFShader = "precision " + gd.precision + " float;\n" + shaderConfig.fogFShader.resource;

            blendedMaterials = [];
            
            assets.forEach(function(asset, index) {
                material = asset.resource;

                if (!material)
                    return;

                material.setParameter('fog_start_dist', shaderConfig.fogStart);
                material.setParameter('fog_end_dist', shaderConfig.fogEnd);

                if (material.blendType == pc.BLEND_NONE) {
                    material.blendType = pc.BLEND_NORMAL;
                    material.opacity = 1;
                    
                    blendedMaterials.push(material);
                }

                material.chunks.opacityPS = shaderConfig.useFogShader ? fogFShader : pc.shaderChunks.opacityPS;

                material.update();
            });

        }.bind(this),
    
        onDisable = function () {
            var config = this[tr.Storage.gameArea];
                
            if (config.lightNight)
                config.lightNight.enabled = false;
            
            this.app.scene.skyboxRotation = sceneParams.skyboxRotation;
            this.app.scene.fogStart = sceneParams.fogStart;
            this.app.scene.fogEnd = sceneParams.fogEnd;
            this.app.scene.fogColor = sceneParams.fogColor;
            this.app.scene.ambientLight = sceneParams.ambientLight;
            this.app.scene.exposure = sceneParams.exposure;
            
            blendedMaterials.forEach(function(material, index) {
                material.blendType = pc.BLEND_NONE;
            });
        }.bind(this);
    
    this.on('enable', onEnable);
    this.on('disable', onDisable);
    this.on('attr', onEnable);
    
    onEnable();
};

// tween.js
pc.extend(pc, function () {

    /**
     * @name pc.TweenManager
     * @description Handles updating tweens
     * @param {pc.Application} app  The application
     */
    var TweenManager = function (app) {
        this._app = app;
        this._tweens = [];
        this._add = []; // to be added
    };

    TweenManager.prototype = {
        add: function (tween) {
            this._add.push(tween);
            return tween;
        },

        update: function (dt) {
            var i = 0;
            var n = this._tweens.length;
            while (i < n) {
                if (this._tweens[i].update(dt)) {
                    i++;
                } else {
                    this._tweens.splice(i, 1);
                    n--;
                }
            }

            // add any tweens that were added mid-update
            if (this._add.length) {
                this._tweens = this._tweens.concat(this._add);
                this._add.length = 0;
            }
        }
    };

    /**
     * @name  pc.Tween
     * @param {Object} target The target property that will be tweened
     * @param {pc.TweenManager} manager The tween manager
     * @param {pc.Entity} entity The pc.Entity whose property we are tweening
     */
    var Tween = function (target, manager, entity) {
        pc.events.attach(this);

        this.manager = manager;

        if (entity) {
            this.entity = null; // if present the tween will dirty the transforms after modify the target
        }

        this.time = 0;

        this.complete = false;
        this.playing = false;
        this.stopped = true;
        this.pending = false;

        this.target = target;

        this.duration = 0;
        this._currentDelay = 0;
        this.timeScale = 1;
        this._reverse = false;

        this._delay = 0;
        this._yoyo = false;

        this._count = 0;
        this._numRepeats = 0;
        this._repeatDelay = 0;

        this._from = false; // indicates a "from" tween

        // for rotation tween
        this._slerp = false; // indicates a rotation tween
        this._fromQuat = new pc.Quat();
        this._toQuat = new pc.Quat();
        this._quat = new pc.Quat();

        this.easing = pc.Linear;

        this._sv = {}; // start values
        this._ev = {}; // end values
    };

    var _parseProperties = function (properties) {
        var _properties;
        if (properties instanceof pc.Vec2) {
            _properties = {
                x: properties.x,
                y: properties.y
            };
        } else if (properties instanceof pc.Vec3) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z
            };
        } else if (properties instanceof pc.Vec4) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Quat) {
            _properties = {
                x: properties.x,
                y: properties.y,
                z: properties.z,
                w: properties.w
            };
        } else if (properties instanceof pc.Color) {
            _properties = {
                r: properties.r,
                g: properties.g,
                b: properties.b,
            };
            if (properties.a !== undefined) {
                _properties.a = properties.a;
            }
        } else {
            _properties = properties;
        }
        return _properties;
    }
    Tween.prototype = {
        // properties - js obj of values to update in target
        to: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            return this;
        },

        from: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);
            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._from = true;

            return this;
        },

        rotate: function (properties, duration, easing, delay, repeat, yoyo) {
            this._properties = _parseProperties(properties);

            this.duration = duration;

            if (easing) this.easing = easing;
            if (delay) {
                this.delay(delay);
            }
            if (repeat) {
                this.repeat(repeat);
            }

            if (yoyo) {
                this.yoyo(yoyo);
            }

            this._slerp = true;

            return this;
        },

        start: function () {
            var prop, _x, _y, _z;

            this.playing = true;
            this.complete = false;
            this.stopped = false;
            this._count = 0;
            this.pending = (this._delay > 0);

            if (this._reverse && !this.pending) {
                this.time = this.duration;
            } else {
                this.time = 0;
            }

            if (this._from) {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this._properties[prop];
                        this._ev[prop] = this.target[prop];
                    }
                }

                if (this._slerp) {
                    this._toQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);

                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;
                    this._fromQuat.setFromEulerAngles(_x, _y, _z);
                }
            } else {
                for (prop in this._properties) {
                    if (this._properties.hasOwnProperty(prop)) {
                        this._sv[prop] = this.target[prop];
                        this._ev[prop] = this._properties[prop];
                    }
                }

                if (this._slerp) {
                    this._fromQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z);

                    _x = this._properties.x !== undefined ? this._properties.x : this.target.x;
                    _y = this._properties.y !== undefined ? this._properties.y : this.target.y;
                    _z = this._properties.z !== undefined ? this._properties.z : this.target.z;
                    this._toQuat.setFromEulerAngles(_x, _y, _z);
                }
            }

            // set delay
            this._currentDelay = this._delay;

            // add to manager when started
            this.manager.add(this);

            return this;
        },

        pause: function () {
            this.playing = false;
        },

        resume: function () {
            this.playing = true;
        },

        stop: function () {
            this.playing = false;
            this.stopped = true;
        },

        delay: function (delay) {
            this._delay = delay;
            this.pending = true;

            return this;
        },

        repeat: function (num, delay) {
            this._count = 0;
            this._numRepeats = num;
            if (delay) {
                this._repeatDelay = delay;
            } else {
                this._repeatDelay = 0;
            }

            return this;
        },

        loop: function (loop) {
            if (loop) {
                this._count = 0;
                this._numRepeats = Infinity;
            } else {
                this._numRepeats = 0;
            }

            return this;
        },

        yoyo: function (yoyo) {
            this._yoyo = yoyo;
            return this;
        },

        reverse: function () {
            this._reverse = !this._reverse;

            return this;
        },

        chain: function () {
            var n = arguments.length;

            while(n--) {
                if (n > 0) {
                    arguments[n-1]._chained = arguments[n];
                } else {
                    this._chained = arguments[n];
                }
            }

            return this;
        },

        update: function (dt) {
            if (this.stopped) return false;

            if (!this.playing) return true;

            if (!this._reverse || this.pending) {
                this.time += dt*this.timeScale;
            } else {
                this.time -= dt*this.timeScale;
            }

            // delay start if required
            if (this.pending) {
                if (this.time > this._currentDelay) {
                    if (this._reverse) {
                        this.time = this.duration - (this.time - this._currentDelay);
                    } else {
                        this.time = this.time - this._currentDelay;
                    }
                    this.pending = false;
                } else {
                    return true;
                }
            }

            var _extra = 0;
            if ((!this._reverse && this.time > this.duration) || (this._reverse && this.time < 0)){
                this._count++;
                this.complete = true;
                this.playing = false;
                if (this._reverse) {
                    _extra = this.duration - this.time;
                    this.time = 0;
                } else {
                    _extra = this.time - this.duration;
                    this.time = this.duration;
                }
            }

            var elapsed = (this.duration === 0) ? 1 : (this.time / this.duration);

            // run easing
            var a = this.easing(elapsed);

            // increment property
            var s,e,d;
            for (var prop in this._properties) {
                if (this._properties.hasOwnProperty(prop)) {
                    s = this._sv[prop];
                    e = this._ev[prop];
                    this.target[prop] = s + (e - s) * a;
                }
            }

            if (this._slerp) {
                this._quat.slerp(this._fromQuat, this._toQuat, a);
            }

            // if this is a entity property then we should dirty the transform
            if (this.entity) {
                this.entity._dirtifyLocal();

                // apply element property changes
                if (this.element && this.entity.element) {
                    this.entity.element[this.element] = this.target;
                }

                if (this._slerp) {
                    this.entity.setLocalRotation(this._quat);
                }
            }

            this.fire("update", dt);

            if (this.complete) {
                var repeat = this._repeat(_extra);
                if (!repeat) {
                    this.fire("complete", _extra);
                    if (this.entity)
                        this.entity.off('destroy', this.stop, this);
                    if (this._chained) this._chained.start();
                } else {
                    this.fire("loop");
                }

                return repeat;
            }

            return true;
        },

        _repeat: function (extra) {
            // test for repeat conditions
            if (this._count < this._numRepeats) {
                // do a repeat
                if (this._reverse) {
                    this.time = this.duration - extra;
                } else {
                    this.time = extra; // include overspill time
                }
                this.complete = false;
                this.playing = true;

                this._currentDelay = this._repeatDelay;
                this.pending = true;

                if (this._yoyo) {
                    // swap start/end properties
                    for (var prop in this._properties) {
                        var tmp = this._sv[prop];
                        this._sv[prop] = this._ev[prop];
                        this._ev[prop] = tmp;
                    }

                    if (this._slerp) {
                        this._quat.copy(this._fromQuat);
                        this._fromQuat.copy(this._toQuat);
                        this._toQuat.copy(this._quat);
                    }
                }

                return true;
            }
            return false;
        },

    };


    /**
     * Easing methods
     */

    var Linear = function (k) {
        return k;
    };

    var QuadraticIn = function (k) {
        return k * k;
    };

    var QuadraticOut = function (k) {
        return k * (2 - k);
    };

    var QuadraticInOut = function (k) {
        if ((k *= 2) < 1) {
            return 0.5 * k * k;
        }
        return -0.5 * (--k * (k - 2) - 1);
    };

    var CubicIn = function (k) {
        return k * k * k;
    };

    var CubicOut = function (k) {
        return --k * k * k + 1;
    };

    var CubicInOut = function (k) {
        if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
        return 0.5 * ( ( k -= 2 ) * k * k + 2 );
    };

    var QuarticIn = function (k) {
            return k * k * k * k;
    };

    var QuarticOut = function (k) {
        return 1 - ( --k * k * k * k );
    };

    var QuarticInOut = function (k) {
        if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
        return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );
    };

    var QuinticIn = function (k) {
            return k * k * k * k * k;
    };

    var QuinticOut = function (k) {
            return --k * k * k * k * k + 1;
    };

    var QuinticInOut = function (k) {
        if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
        return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );
    };

    var SineIn = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 1 - Math.cos( k * Math.PI / 2 );
    };

    var SineOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return Math.sin( k * Math.PI / 2 );
    };

    var SineInOut = function (k) {
        if (k === 0) return 0;
        if (k === 1) return 1;
        return 0.5 * ( 1 - Math.cos( Math.PI * k ) );
    };

    var ExponentialIn = function (k) {
        return k === 0 ? 0 : Math.pow( 1024, k - 1 );
    };

    var ExponentialOut = function (k) {
        return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );
    };

    var ExponentialInOut = function (k) {
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
        return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );
    };

    var CircularIn = function (k) {
        return 1 - Math.sqrt( 1 - k * k );
    };

    var CircularOut = function (k) {
        return Math.sqrt( 1 - ( --k * k ) );
    };

    var CircularInOut = function (k) {
        if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
        return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
    };

    var ElasticIn = function (k) {
        var s, a = 0.1, p = 0.4;
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( !a || a < 1 ) { a = 1; s = p / 4; }
        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
        return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
    };

    var ElasticOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( !a || a < 1 ) { a = 1; s = p / 4; }
        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
        return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
    };

    var ElasticInOut = function (k) {
        var s, a = 0.1, p = 0.4;
        if ( k === 0 ) return 0;
        if ( k === 1 ) return 1;
        if ( !a || a < 1 ) { a = 1; s = p / 4; }
        else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
        if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
        return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
    };

    var BackIn = function (k) {
            var s = 1.70158;
            return k * k * ( ( s + 1 ) * k - s );
    };

    var BackOut = function (k) {
        var s = 1.70158;
        return --k * k * ( ( s + 1 ) * k + s ) + 1;
    };

    var BackInOut = function (k) {
        var s = 1.70158 * 1.525;
        if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
        return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
    };

    var BounceIn = function (k) {
        return 1 - BounceOut( 1 - k );
    };

    var BounceOut = function (k) {
        if ( k < ( 1 / 2.75 ) ) {
            return 7.5625 * k * k;
        } else if ( k < ( 2 / 2.75 ) ) {
            return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
        } else if ( k < ( 2.5 / 2.75 ) ) {
            return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
        } else {
            return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
        }
    };

    var BounceInOut = function (k) {
        if ( k < 0.5 ) return BounceIn( k * 2 ) * 0.5;
        return BounceOut( k * 2 - 1 ) * 0.5 + 0.5;
    };

    return {
        TweenManager: TweenManager,
        Tween: Tween,
        Linear: Linear,
        QuadraticIn: QuadraticIn,
        QuadraticOut: QuadraticOut,
        QuadraticInOut: QuadraticInOut,
        CubicIn: CubicIn,
        CubicOut: CubicOut,
        CubicInOut: CubicInOut,
        QuarticIn: QuarticIn,
        QuarticOut: QuarticOut,
        QuarticInOut: QuarticInOut,
        QuinticIn: QuinticIn,
        QuinticOut: QuinticOut,
        QuinticInOut: QuinticInOut,
        SineIn: SineIn,
        SineOut: SineOut,
        SineInOut: SineInOut,
        ExponentialIn: ExponentialIn,
        ExponentialOut: ExponentialOut,
        ExponentialInOut: ExponentialInOut,
        CircularIn: CircularIn,
        CircularOut: CircularOut,
        CircularInOut: CircularInOut,
        BackIn: BackIn,
        BackOut: BackOut,
        BackInOut: BackInOut,
        BounceIn: BounceIn,
        BounceOut: BounceOut,
        BounceInOut: BounceInOut,
        ElasticIn: ElasticIn,
        ElasticOut: ElasticOut,
        ElasticInOut: ElasticInOut
    };
}());

// Expose prototype methods and create a default tween manager on the application
(function () {
    // Add pc.Application#addTweenManager method
    pc.Application.prototype.addTweenManager = function () {
        this._tweenManager = new pc.TweenManager(this);

        this.on("update", function (dt) {
            this._tweenManager.update(dt);
        });
    };

    // Add pc.Application#tween method
    pc.Application.prototype.tween = function (target) {
        return new pc.Tween(target, this._tweenManager);
    };

    // Add pc.Entity#tween method
    pc.Entity.prototype.tween = function (target, options) {
        var tween = this._app.tween(target);
        tween.entity = this;

        this.once('destroy', tween.stop, tween);

        if (options && options.element) {
            // specifiy a element property to be updated
            tween.element = options.element;
        }
        return tween;
    };

    // Create a default tween manager on the application
    var application = pc.Application.getApplication();
    if (application) {
        application.addTweenManager();
    }
})();

// crash-effect.js
var CrashEffect = pc.createScript('crashEffect');

CrashEffect.attributes.add('glassTexture', {
    type: 'entity',
    description: 'Broken glass texture'
});

CrashEffect.attributes.add('bloodTexture', {
    type: 'entity',
    description: 'Blood texture'
});

// initialize code called once per entity
CrashEffect.prototype.initialize = function() {
    var onEnable = function () {
        this.glassTexture.element.opacity = 0;
        this.app.tween(this.glassTexture.element).to({opacity: 1}, 1, pc.QuinticOut).start();
        
        if (!this.bloodTexture)
            return;
        
        this.bloodTexture.element.opacity = 0;
        this.bloodTexture
            .tween(this.bloodTexture.element)
            .to({opacity: 1}, 1, pc.Linear)
            .yoyo(true)
            .repeat(2)
            .start();
        
    }.bind(this);
    
    this.on('enable', onEnable);
    
    onEnable();
};



// topology-controller.js
var TopologyController = pc.createScript('topologyController');

TopologyController.attributes.add('topologyVShader', {
    type: 'asset',
    assetType: 'shader',
    description: 'Topology warp shader asset'
});

TopologyController.attributes.add('maxSlope', {
    type: 'vec3',
    default: [0, 0.0007, 0.0007],
    description: 'Max corner slope'
});

TopologyController.attributes.add('avgCornerLength', {
    type: 'number',
    default: 100,
    description: 'Average corner length +-50%'
});

TopologyController.attributes.add('twistinness', {
    type: 'number',
    default: 0.01,
    description: 'Road twistinness'
});

TopologyController.attributes.add('isStatic', {
    type: 'boolean',
    default: false,
    description: 'Static world'
});

TopologyController.attributes.add('staticSlope', {
    type: 'vec3',
    default: [0, 0, 0],
    description: 'Static corner slope. Only for static mode.'
});

// initialize code called once per entity
TopologyController.prototype.initialize = function() {
    var onEnable = function () {
            this.currentSlope.copy(this.staticSlope);
            this.toggle(true);
            this.updateCorner();
        }.bind(this),
        
        onDisable = function () {
            this.toggle(false);
        }.bind(this);
    
    this.currentSlope = new pc.Vec3(0, 0, 0);
    this.targetSlope = new pc.Vec3(0, 0, 0);
    this.dS = new pc.Vec3(0, 0, 0);
    this.cornerDist = 0;
    this.acceleration = tr.Storage.acceleration;
    
    this.topologyYSlope = this.app.graphicsDevice.scope.resolve("topologyYSlope");
    this.topologyZSlope = this.app.graphicsDevice.scope.resolve("topologyZSlope");
    
    this.on('enable', onEnable);
    this.on('disable', onDisable);
    this.on('attr', onEnable);
    
    onEnable();
};

TopologyController.prototype.toggle = function (state) {
    var gd = this.app.graphicsDevice,
        topologyVShader,
        material,

        assets = this.app.assets.filter(function (asset) {
            return asset.type === 'material';
        });

    // dynamically set the precision depending on device.
    topologyVShader = "precision " + gd.precision + " float;\n" + this.topologyVShader.resource;
    
    this.topologyYSlope.setValue(this.staticSlope.y);
    this.topologyZSlope.setValue(this.staticSlope.z);
    
    assets.forEach(function(asset, index) {
        material = asset.resource;

        if (!material)
            return;

        material.chunks.transformVS = state ? topologyVShader : pc.shaderChunks.transformVS;

        material.update();
    });
};

TopologyController.prototype.updateCorner = function () {
    this.targetSlope.set(0,
                         tr.Utils.getRandomNumber(-this.maxSlope.y, this.maxSlope.y),
                         tr.Utils.getRandomNumber(-this.maxSlope.z, this.maxSlope.z));
    
    this.cornerDist = tr.Utils.getRandomInt(this.avgCornerLength * 0.5, this.avgCornerLength * 1.5);
};

TopologyController.prototype.update = function (dt) {
    if (this.isStatic)
        return;
    
    if (this.currentSlope.distance(this.targetSlope) < (this.targetSlope.length() * dt)) {
        this.cornerDist -= this.acceleration.velocity * dt;
    } else {
        this.dS.sub2(this.targetSlope, this.currentSlope).scale(dt * this.acceleration.velocity * this.twistinness);
        this.currentSlope.add(this.dS);
    }
    
    if (this.cornerDist <= 0)
        this.updateCorner();
    
    this.topologyYSlope.setValue(this.currentSlope.y);
    this.topologyZSlope.setValue(this.currentSlope.z);
};


// flare-controller.js
var FlareController = pc.createScript("flareController");

FlareController.attributes.add('vs', {
    type: 'asset',
    assetType: 'shader',
    title: 'Vertex Shader'
});

FlareController.attributes.add('fs', {
    type: 'asset',
    assetType: 'shader',
    title: 'Fragment Shader'
});

FlareController.prototype.initialize = function() {
    var app = this.app, 
        self = this,
        i;
    
    this.material = new pc.BasicMaterial();
    
    this.material.updateShader = function(e) {
        this.shader = new pc.Shader(e, {
            attributes: {
                vertex_position: pc.SEMANTIC_POSITION
            },
            vshader: self.vs.resource,
            fshader: self.fs.resource
        });
    };
    
    this.material.depthTest = false;
    this.material.depthWrite = false;
    this.material.blend = true;
    this.material.blendSrc = 1;
    this.material.blendDst = 1;
    this.material.cull = pc.CULLFACE_NONE;
    this.material.update();
    
    var vertArr = [-0.5, 0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0, -0.5, -0.5, 0], 
        indices = [2, 1, 0, 0, 3, 2],
        vertNum = vertArr.length / 3,
        vertFormat = new pc.VertexFormat(app.graphicsDevice,[{
            semantic: pc.SEMANTIC_POSITION,
            components: 3,
            type: pc.ELEMENTTYPE_FLOAT32
        }]), 
        vertBuffer = new pc.VertexBuffer(app.graphicsDevice, vertFormat, vertNum),
        vertIterator = new pc.VertexIterator(vertBuffer);
    
    for (i = 0; i < vertNum; i++) {
        vertIterator.element[pc.SEMANTIC_POSITION].set(vertArr[3 * i], vertArr[3 * i + 1], vertArr[3 * i + 2]);
        vertIterator.next();
    }
    
    vertIterator.end();
    
    var indBuffer = new pc.IndexBuffer(app.graphicsDevice, pc.INDEXFORMAT_UINT16, indices.length);
    new Uint16Array(indBuffer.lock()).set(indices);
    indBuffer.unlock();
    
    var mesh = new pc.Mesh();
    mesh.vertexBuffer = vertBuffer;
    mesh.indexBuffer[0] = indBuffer;
    mesh.primitive[0].type = pc.PRIMITIVE_TRIANGLES;
    mesh.primitive[0].base = 0;
    mesh.primitive[0].count = indices.length;
    mesh.primitive[0].indexed = true;
    
    var graphNode = new pc.GraphNode(),
        meshInst = new pc.MeshInstance(graphNode, mesh, this.material);
    
    meshInst.updateKey();
    
    var model = new pc.Model();
    model.graph = graphNode;
    model.meshInstances = [meshInst];
    
    tr.Storage.flareModel = model;
    
    this.app.on(tr.Events.GARAGE_ENTER, function () {
        this.material.depthTest = false;
        this.material.depthWrite = false;
        this.material.update();
    }.bind(this));
    
    this.app.on(tr.Events.GAME_ENTER, function () {
        this.material.depthTest = true;
        this.material.depthWrite = true;
        this.material.update();
    }.bind(this));
};

// revive-screen.js
var ReviveScreen = pc.createScript('reviveScreen');

ReviveScreen.attributes.add("watchAdBtn", {type: "entity"});
ReviveScreen.attributes.add("timerProgress", {type: "entity"});
ReviveScreen.attributes.add("timerProgressBg", {type: "entity"});
ReviveScreen.attributes.add("title", {type: "entity"});
ReviveScreen.attributes.add("title2", {type: "entity"});
ReviveScreen.attributes.add("titleBoss", {type: "entity"});
ReviveScreen.attributes.add("title2Boss", {type: "entity"});
ReviveScreen.attributes.add("timeText", {type: "entity"});

// initialize code called once per entity
ReviveScreen.prototype.initialize = function() {
    
    var onEnable = function () {
        this.showingAd = false;
        
        this.title.enabled = tr.Storage.acceleration.isRunning();
        this.title2.enabled = tr.Storage.acceleration.isRunning();
        this.titleBoss.enabled = !tr.Storage.acceleration.isRunning();
        this.title2Boss.enabled = !tr.Storage.acceleration.isRunning();
        
        this.timerProgress.element.width = this.progressWidth;
        
        this.timeText.element.text = "+" + tr.Storage.mission.reviveTime + " SECONDS";
    }.bind(this);
    
    this.progressWidth = this.timerProgressBg.element.width;
    this.step = this.progressWidth / 5 / 60;
    
    this.on('enable', onEnable);
    
    this.watchAdBtn.element.on('click', () => {
        if (this.showingAd)
            return;
        
        tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
        
        if (Apicontroller.hasRewardedVideo()) {
            this.showingAd = true;
            
            Apicontroller.showRewardedVideo((result) => {
                if (result.rewardGranted) {
                    this.app.fire(tr.Events.GAME_RESUME);
                    
                    tr.Storage.timeRemaining += tr.Storage.mission.reviveTime;
                    
                    if (!tr.Storage.acceleration.isRunning())
                        this.app.fire(tr.Events.CRASH_RESET);
                    
                    this.app.fire(tr.Events.GAME_COUNTDOWN);
                } else {
                    this.gameOver();
                }
            });
        }
    });
    
    onEnable();
};

ReviveScreen.prototype.gameOver = function() {
    tr.Storage.gameState = tr.Keys.GAME_STATES.FAILED;

    this.app.fire(tr.Events.GAME_OVER);
};

// update code called every frame
ReviveScreen.prototype.update = function() {
    if (this.showingAd)
        return;
    
    this.timerProgress.element.width -= this.step;
    
    if (this.timerProgress.element.width <= 0)
        this.gameOver();
};

// mission-controller.js
var MissionController = pc.createScript('missionController'),
    
    missionSchema = [{
        name: 'carsNumber',
        type: 'number',
        default: 15,
        title: 'Cars number',
        description: 'Max cars number at the same time'
    }, {
        name: 'twoWay',
        type: 'boolean',
        default: true,
        title: 'Two way',
        description: 'Two way movement'
    }, {
        name: 'nightProb',
        type: 'number',
        default: 0.5,
        title: 'Night probability',
        description: 'Night mode probability'
    }, {
        name: 'entryBikeSpeed',
        type: 'number',
        default: 0,
        title: 'Entry bike speed',
        description: 'Needed bike speed to enter mission'
    }, {
        name: 'reward',
        type: 'number',
        default: 0,
        title: 'Reward',
        description: 'Mission reward'
    }, {
        name: 'rewardRep',
        type: 'number',
        default: 0,
        title: 'Reward repeat',
        description: 'Reward if mission is allready passed'
    }, {
        name: 'mode',
        type: 'string',
        enum: [
            { 'CHECKPOINT_RUN': 'checkpointRun' },
            { 'OVERTAKE': 'overtake' },
            { 'COMBO': 'combo' },
            { 'RACE': 'race' }
        ],
        title: 'Mode',
        description: 'Mission mode'
    }, {
        name: 'checkpoints',
        type: 'number',
        default: 0,
        title: 'Checkpoints'
    }, {
        name: 'startTime',
        type: 'number',
        default: 0,
        title: 'Time at start'
    }, {
        name: 'addTime',
        type: 'number',
        default: 0,
        title: 'Add time',
        description: 'Time added on checkpoint'
    }, {
        name: 'distance',
        type: 'number',
        default: 0,
        title: 'Distance km'
    }, {
        name: 'overtakes',
        type: 'number',
        default: 0,
        title: 'Overtakes'
    }, {
        name: 'xCombo',
        type: 'number',
        default: 0,
        title: 'xCombo',
        description: 'Max combo needed'
    }, {
        name: 'bossBike',
        type: 'number',
        default: 0,
        title: 'bossBike',
        description: 'Bike # unlocked on this level'
    }, {
        name: 'boss',
        type: 'string',
        enum: [
            { 'BOSS_1': 'BigMike' },
            { 'BOSS_2': 'Weasel' },
            { 'BOSS_3': 'TheFalcon' },
            { 'SIDEBOSS': 'Goon' }
        ],
        title: 'Boss'
    }, {
        name: 'coinsNumber',
        type: 'number',
        default: 0,
        title: 'coinsNumber',
        description: 'Number of coins to collect'
    }, {
        name: 'coinProb',
        type: 'number',
        default: 0,
        title: 'coinProbability',
        description: 'Probability of coin'
    }, {
        name: 'throwCooldown',
        type: 'number',
        default: 0,
        title: 'throwCooldown',
        description: 'Cooldown seconds between throws'
    }, {
        name: 'bossDistRatio',
        type: 'number',
        default: 1,
        title: 'bossDistRatio',
        description: 'Distance to boss ratio'
    }, {
        name: 'reviveTime',
        type: 'number',
        default: 10,
        title: 'reviveTime',
        description: 'Time added on revive'
    }, {
        name: 'spawnNumber',
        type: 'number',
        default: 4,
        title: 'Spawn number',
        description: 'Max number of cars to spawn at the same time'
    }, {
        name: 'cooldownDist',
        type: 'number',
        default: 70,
        title: 'Cooldown distance',
        description: 'Distance to pass until next spawn request'
    }, {
        name: 'cooldownDistOpp',
        type: 'number',
        default: 70,
        title: 'Cooldown distance opposite',
        description: 'Distance to pass until next spawn request on opposite lanes'
    }, {
        name: 'spawnProb',
        type: 'number',
        default: 0.5,
        title: 'Spawn probability',
        description: 'Spawn probability'
    }, {
        name: 'spawnProbOpp',
        type: 'number',
        default: 0.5,
        title: 'Spawn probability opposite',
        description: 'Spawn probability on opposite lanes'
    }, {
        name: 'avgSpeedRatio',
        type: 'number',
        default: 0.33,
        title: 'Avg speed ratio',
        description: 'Avg car speed to max bike speed ratio'
    }, {
        name: 'speedDev',
        type: 'number',
        default: 0.5,
        title: 'Speed deviation',
        description: 'Car speed deviation from average speed'
    }, {
        name: 'oppLaneSpeedRatio',
        type: 'number',
        default: 1,
        title: 'Opposite lane speed ratio',
        description: 'Opposite lane speed to following lane speed ratio'
    }];

MissionController.attributes.add('missions', {
    type: 'json',
    array: true,
    schema: missionSchema
});

MissionController.prototype.getReward = function (mission) {
    return this.isFirstPass(mission) ? mission.reward : mission.rewardRep; 
};

MissionController.prototype.isFirstPass = function (mission) {
    return tr.Storage.level == tr.Storage.currentMission;
};



// commonParticleBurstEffect.js
/* jshint esversion: 6 */
var CommonParticleBurstEffect = pc.createScript('commonParticleBurstEffect');

CommonParticleBurstEffect.attributes.add('triggerEventKey', {
    type: 'string',
    enum: [
        { 'COIN_COLLECTED': 'coin:collected' }
    ]
});

CommonParticleBurstEffect.attributes.add('worldPositionOffset', {
    type: 'vec3',
    default: [0, 0, 0]
});

CommonParticleBurstEffect.attributes.add('delay', {
    type: 'number',
    description: "Delay (seconds)",
    default: 0
});


CommonParticleBurstEffect.prototype.initialize = function() {
    if (this.triggerEventKey) {
        this.entity.parent.on(this.triggerEventKey, this.activateEffect, this);
    }
};

CommonParticleBurstEffect.prototype.activateEffect = function(...args) {
    if (this.delay > 0) {
        this.entity.delayedCall(this.delay * 1000, () => this._doActivateEffect(...args));
    } else {
        this._doActivateEffect(...args);
    }
};

CommonParticleBurstEffect.prototype._doActivateEffect = function(...args) {
    this.entity.translate(this.worldPositionOffset);

    this.entity.children.forEach(child => {
        if(child.particlesystem) {
            child.particlesystem.reset();
            child.particlesystem.play();
        } 
    });
};


/* Delayed call implementation */
pc.Entity.prototype.delayedCall = function (durationMS, f, scope) {
    var n = 0;
    while(this["delayedExecuteTween" + n]) {
        n++;
    }
    var id = "delayedExecuteTween" + n;
    var m;
    this[id] = this.tween(m)
        .to(1, durationMS / 1000, pc.Linear)
    ;
    this[id].start();
    
    this[id].once("complete", function() {
        f.call(scope);
        this[id] = null;
    }, this);
    
    return this[id];
};


// collectables-controller.js
var CollectablesController = pc.createScript('collectablesController');

// initialize code called once per entity
CollectablesController.prototype.initialize = function() {
    this.bombTemplate = this.app.assets.find('Bomb', 'template');
    this.coinTemplate = this.app.assets.find('Coin', 'template');
    
    this.bombs = [];
    this.coins = [];
    
    this.on('enable', this.reset, this);
    this.app.on(tr.Events.COIN_THROW, this.throwCoin, this);
    this.app.on(tr.Events.BOMB_THROW, this.throwBomb, this);
    this.reset();
};

CollectablesController.prototype.reset = function () {
    this.bombs.forEach(function (bomb, index) {
        bomb.destroy();
    }.bind(this));
    
    this.bombs = [];
    
    this.coins.forEach(function (coin, index) {
        coin.destroy();
    }.bind(this));
    
    this.coins = [];
};

CollectablesController.prototype.throwBomb = function(botPos) {
    var bomb = this.bombTemplate.resource.instantiate(),
        bombPos = bomb.getPosition();
    
    bomb.setPosition(botPos.x, bombPos.y, botPos.z);
    
    this.entity.addChild(bomb);
    this.bombs.push(bomb);
    
    bomb.enabled = true;
};

CollectablesController.prototype.throwCoin = function(botPos) {
    var coin = this.coinTemplate.resource.instantiate(),
        coinPos = coin.getPosition();
    
    coin.setPosition(botPos.x, coinPos.y, botPos.z);
    
    this.entity.addChild(coin);
    this.coins.push(coin);
    
    coin.enabled = true;
};

// update code called every frame
CollectablesController.prototype.update = function(dt) {
    for (i = 0; i < this.bombs.length; i++) {
        bombPos = this.bombs[i].getPosition();
        
        if (bombPos.x < -30) {
            this.bombs[i].destroy();
            this.bombs.splice(i--, 1);
        }
    }
    
    for (i = 0; i < this.coins.length; i++) {
        coinPos = this.coins[i].getPosition();
        
        if (coinPos.x < -30) {
            this.coins[i].destroy();
            this.coins.splice(i--, 1);
        }
    }
};

// motionblur.js
//--------------- POST EFFECT DEFINITION ------------------------//
pc.extend(pc, function () {
    function createRenderTarget(gd) {
        // Create a 512x512x24-bit render target with a depth buffer
        var colorBuffer = new pc.Texture(gd, {
            width: gd.width,
            height: gd.height,
            format: pc.PIXELFORMAT_R8_G8_B8,
            autoMipmap: false
        });
        colorBuffer.minFilter = pc.FILTER_LINEAR;
        colorBuffer.magFilter = pc.FILTER_LINEAR;
        colorBuffer.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
        colorBuffer.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
        var renderTarget = new pc.RenderTarget(gd, colorBuffer, {
            depth: true
        });
        
        return renderTarget;
    }

    /**
     * @name pc.MotionBlur
     * @class Implements the motion blur effect.
     * @constructor Creates new instance of the post effect.
     * @extends pc.PostEffect
     * @param {pc.Device} graphicsDevice The graphics device of the application
     * @property {Number} amount Controls the intensity of the effect. Ranges from 0 to 1.
     */
    var MotionBlur = function (graphicsDevice) {
        var vertexShader = [
            "attribute vec2 aPosition;",
            "",
            "varying vec2 vUv0;",
            "",
            "void main(void)",
            "{",
            "    gl_Position = vec4(aPosition, 0.0, 1.0);",
            "    vUv0 = (aPosition.xy + 1.0) * 0.5;",
            "}"
        ].join("\n");
        
        this.blurShader = new pc.Shader(graphicsDevice, {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION
            },
            vshader: vertexShader,
            fshader: [
                "precision " + graphicsDevice.precision + " float;",
                "",
                "uniform float uAmount;",
                "uniform float uSmoothingPower;",
                "uniform sampler2D uCurrColorBuffer;",
                "uniform sampler2D uPrevColorBuffer;",
                "",
                "varying vec2 vUv0;",
                "",
                "void main() {",
                "    vec4 color1 = texture2D(uCurrColorBuffer, vUv0);",
                "    vec4 color2 = texture2D(uPrevColorBuffer, vUv0);",
                "",
                "    float calculatedAmount = abs(pow(2.0 * (vUv0.x - 0.5), uSmoothingPower)); ",  //2.0 * abs(vUv0.x - 0.5) 
                "    float normalizedAmount = clamp(calculatedAmount * uAmount, 0.0, 1.0); ", 
                "    gl_FragColor = mix(color1, color2, normalizedAmount);",
                "}"
            ].join("\n")
        });

        this.copyShader = new pc.Shader(graphicsDevice, {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION
            },
            vshader: vertexShader,
            fshader: [
                "precision " + graphicsDevice.precision + " float;",
                "",
                "uniform sampler2D uColorBuffer;",
                "",
                "varying vec2 vUv0;",
                "",
                "void main() {",
                "    vec4 color = texture2D(uColorBuffer, vUv0);",
                "",
                "    gl_FragColor = color;",
                "}"
            ].join("\n")
        });

        this.tempTarget = createRenderTarget(graphicsDevice);

        // Uniforms
        this.amount = 1;
    };

    MotionBlur = pc.inherits(MotionBlur, pc.PostEffect);

    MotionBlur.prototype = pc.extend(MotionBlur.prototype, {
        render: function (inputTarget, outputTarget, rect) {
            var device = this.device;
            var scope = device.scope;

            if (!this.prevTarget) {
                this.prevTarget = createRenderTarget(device);
                scope.resolve("uColorBuffer").setValue(inputTarget.colorBuffer);
                pc.drawFullscreenQuad(device, this.tempTarget, this.vertexBuffer, this.copyShader, rect);
            } else {
                scope.resolve("uAmount").setValue(this.amount);
                scope.resolve("uSmoothingPower").setValue(this.smoothingPower);
                scope.resolve("uCurrColorBuffer").setValue(inputTarget.colorBuffer);
                scope.resolve("uPrevColorBuffer").setValue(this.prevTarget.colorBuffer);
                pc.drawFullscreenQuad(device, this.tempTarget, this.vertexBuffer, this.blurShader, rect);
            }

            scope.resolve("uColorBuffer").setValue(this.tempTarget.colorBuffer);
            pc.drawFullscreenQuad(device, this.prevTarget, this.vertexBuffer, this.copyShader, rect);

            scope.resolve("uColorBuffer").setValue(this.tempTarget.colorBuffer);
            pc.drawFullscreenQuad(device, outputTarget, this.vertexBuffer, this.copyShader, rect);
        }
    });

    return {
        MotionBlur: MotionBlur
    };
}());


var MotionBlur = pc.createScript('motionBlur');

MotionBlur.attributes.add('amount', { type: 'number', default: 1, min: 0, max: 1, step: 0.01 });

MotionBlur.attributes.add('smoothingPower', { type: 'number', default: 1, min: 0, max: 10, step: 0.25 });

MotionBlur.prototype.initialize = function () {
    this.effect = new pc.MotionBlur(this.app.graphicsDevice);
    this.effect.amount = this.amount;
    this.on('set', this.onAttributeChanged, this);
    
    this.on('attr', function(name, value, prev) {
        this.effect[name] = value;
    });    

    this.on("enable", function () {
        this.entity.camera.postEffects.addEffect(this.effect);
    });

    this.on("disable", function () {
        this.entity.camera.postEffects.removeEffect(this.effect);
    });
    
    this.entity.camera.renderTarget = this.effect.prevTarget;
    this.entity.camera.postEffects.addEffect(this.effect);
};


// animated-wrench.js
var AnimatedWrench = pc.createScript('animatedWrench');

// initialize code called once per entity
AnimatedWrench.prototype.initialize = function() {
    this.wrenchCounter = this.app.root.findByName('WrenchIconProgress');
    this.DURATION = 0.7;
    this.time = 0;
    
    this.createPath();
};

// update code called every frame
AnimatedWrench.prototype.update = function(dt) {
    this.time += dt;
    
    // Loop the path flythrough animation indefinitely 
    if (this.time > this.DURATION)
        this.entity.destroy();
    
    // Work out how far we are in time we have progressed along the path
    this.percent = this.time / this.DURATION;
    
    // Get the interpolated values for the position from the curves     
    this.entity.setLocalPosition(this.px.value(this.percent), this.py.value(this.percent), 0);
};

AnimatedWrench.prototype.createPath = function () {
    var curveMode = pc.CURVE_CARDINAL,
        UIScreen = tr.Utils.findUIScreen(this.entity),
        scale = Math.pow(UIScreen.scale, -1),
        wrenchCorners = this.wrenchCounter.element.canvasCorners;
    
    // Create curves for position
    this.px = new pc.Curve();
    this.px.type = curveMode;
    
    this.py = new pc.Curve();
    this.py.type = curveMode;
    
    var nodes = [new pc.Vec3(pc.app.graphicsDevice.width / 2, -pc.app.graphicsDevice.height * 0.9, 0).scale(scale),
                 new pc.Vec3(pc.app.graphicsDevice.width / 3, -pc.app.graphicsDevice.height / 2, 0).scale(scale),
                 new pc.Vec3(wrenchCorners[0].x, -wrenchCorners[0].y, 0).scale(scale)];
    
    // Get the total linear distance of the path (this isn't correct but gives a decent approximation in length)
    var pathLength = 0;
    
    // Store the distance from the start of the path for each path node
    var nodePathLength = [];
    
    // For use when calculating the distance between two nodes on the path
    var distanceBetween = new pc.Vec3();
    
    // Push 0 as we are starting our loop from 1 for ease
    nodePathLength.push(0);
    
    for (i = 1; i < nodes.length; i++) {
        var prevNode = nodes[i-1];
        var nextNode = nodes[i];
        
        // Work out the distance between the current node and the one before in the path
        distanceBetween.sub2(prevNode, nextNode);
        pathLength += distanceBetween.length();
        
        nodePathLength.push(pathLength);
    }
    
    for (i = 0; i < nodes.length; i++) {
        // Calculate the time for the curve key based on the distance of the path to the node
        // and the total path length so the speed of the camera travel stays relatively
        // consistent throughout
        var t = nodePathLength[i] / pathLength;
        
        var node = nodes[i];
        
        var pos = node;
        this.px.add(t, pos.x);
        this.py.add(t, pos.y);
    }
};

// intro-animation.js
var IntroAnimation = pc.createScript('introAnimation');

IntroAnimation.attributes.add("tom", {
    type: "entity", 
    title: "Tom"
});

IntroAnimation.attributes.add("fade", {
    type: "entity", 
    title: "Fade"
});

IntroAnimation.attributes.add("logo", {
    type: "entity", 
    title: "Logo"
});

IntroAnimation.attributes.add("sound", {
    type: "entity", 
    title: "Sound"
});

IntroAnimation.attributes.add("skipText", {
    type: "entity", 
    title: "Skip text"
});

// initialize code called once per entity
IntroAnimation.prototype.initialize = function() {
    var onEnable = function () {
            this.fade.element.opacity = 1;

            this.entity
                .tween(this.fade.element)
                .to({opacity: 0}, 5, pc.Linear)
                .on('complete', function () {
                    this.fade.element.opacity = 0;
                    
                    this.entity
                        .tween(this.fade.element)
                        .to({opacity: 1}, 5, pc.Linear)
                        .delay(20)
                        .start();
                }.bind(this))
                .start();
        
            this.entity
                .tween(this.skipText.element)
                .to({opacity: 1}, 5, pc.Linear)
                .delay(2.5)
                .start();
            
            this.skipText
                .tween(this.skipText.getLocalScale())
                .to({x: 1.075, y: 1.075, z: 1.075}, 0.5, pc.Linear)
                .loop(true)
                .yoyo(true)
                .start();
            
        
            this.logo.delayedCall(23000, function () {
                this.logo.enabled = true;
            }, this);
            
            this.sound.enabled = tr.Storage.sound.music;
        }.bind(this);
    
    this.velocity = 0;
    this.lastPosition = this.tom.getPosition().clone();
    
    this.fade.element.on('click', function () {
        this.sound.sound.stop(tr.Keys.SOUNDS.INTRO);
        this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GARAGE);
    }.bind(this));
    
    this.on('enable', onEnable);
    onEnable();
};

// update code called every frame
IntroAnimation.prototype.update = function(dt) {
    if (!dt)
        return;
    
    this.velocity = this.tom.getPosition().distance(this.lastPosition) / dt;
    this.lastPosition.copy(this.tom.getPosition());
};


// gas-station.js
pc.extend(tr, function () {

    var GasStation = function () {
        tr.Screen.call(this, tr.Keys.SCREENS.GAS_STATION);
    };
    
    GasStation = pc.inherits(GasStation, tr.Screen);
    
    GasStation.prototype.show = function () {
        tr.Storage.nightMode = true;
        tr.Storage.gameArea = tr.Keys.GAME_AREAS.ROUTE66;
        
        tr.Screen.prototype.show.call(this);
    };
    
    GasStation.prototype.hide = function () {
        return tr.Screen.prototype.hide.call(this);
    };
    
    return {
        GasStation: GasStation
    };
    
}());

// elastic-scale-out.js
var ElasticScaleOut = pc.createScript('elasticScaleOut');

ElasticScaleOut.attributes.add('time', {
    type: 'number',
    default: 0.8,
    description: 'Animation time'
});

ElasticScaleOut.attributes.add('delay', {
    type: 'number',
    default: 0,
    description: 'Start delay'
});

ElasticScaleOut.attributes.add('ignoreTimescale', {
    type: 'boolean',
    default: true,
    description: 'Ignore app timescale'
});

// initialize code called once per entity
ElasticScaleOut.prototype.initialize = function() {
    this.FRAME_TIME = 1 / 60;
    
    var onEnable = function () {
        var scaleObj = {x: 0, y: 0, z: 0};
        
        this.entity.setLocalScale(0.1, 0.1, 0.1);
        
        this.animation = this.entity
            .tween(scaleObj)
            .to({x: 1, y: 1, z: 1}, this.time, pc.ElasticOut)
            .on('update', function () {
                this.entity.setLocalScale(scaleObj.x, scaleObj.y, scaleObj.z);
            }.bind(this))
            .delay(this.delay)
            .start();
    }.bind(this);
    
    this.on("enable", onEnable);
    
    onEnable();
};

// update code called every frame
ElasticScaleOut.prototype.update = function(dt) {
    if (!this.animation.complete && this.ignoreTimescale)
        this.animation.update(this.FRAME_TIME - (this.FRAME_TIME * this.app.timeScale));
};

// go.js
var Go = pc.createScript('go');

Go.attributes.add("go", {
    type: "entity", 
    title: "Go button"
});

Go.attributes.add("fade", {
    type: "entity", 
    title: "Fade"
});

// initialize code called once per entity
Go.prototype.initialize = function() {
    var onEnable = function () {
        this.fade.enabled = false;
    }.bind(this);
    
    this.go.element.on('click', function () {
        this.fade.enabled = true;
        tr.SoundController.play(tr.Keys.SOUNDS.BUTTON_CLICK);
        
        this.entity.delayedCall(1, function () {
            this.app.fire(tr.Events.SCREEN_LOAD, tr.Keys.SCREENS.GAS_STATION);
        }, this);
        
    }.bind(this));
    
    this.on('enable', onEnable);
    
    onEnable();
};

// conveyor.js
var Conveyor = pc.createScript('conveyor');

Conveyor.attributes.add('arrowsRoot', {
    type: "entity",
    title: "Arrows root entity"
});

Conveyor.attributes.add('player', {
    type: "entity",
    title: "PlayerPath root entity"
});

Conveyor.attributes.add('pathRoot', {
    type: "entity",
    title: "Path root entity"
});

Conveyor.attributes.add('duration', {
    type: "number",
    default: 10,
    title: "Duration Secs"
});

Conveyor.attributes.add('startTime', {
    type: "number",
    default: 0, 
    title: "Start Time (Secs)", 
    description: "Start the path from a specific point in time"
});


// initialize code called once per entity
Conveyor.prototype.initialize = function() {
    var onEnable = function () {
            this.timescaleAnimation = null;
            this.reset();
        }.bind(this),

        onDisable = function () {
            if (this.timescaleAnimation)
                this.timescaleAnimation.stop();
        }.bind(this),

        arrowTemplate = this.app.assets.find('Arrow', 'template'),
        i;
    
    this.EASE = 0.01;
    this.LANE_HALF_WIDTH = tr.Config.LANES_Z[1];
    this.ARROWS_NUM = 7;
    this.ARROW_INTERVAL = 0.6;
    this.ARROW_DIST = 10;
    this.SLOW_MO_DIST = 20;
    this.SLOW_MO_RATIO = 0.6;
    this.SLOW_MO_TRANSITION = 0.5;
    
    this.arrows = [];
    
    for (i = 0; i < this.ARROWS_NUM; i++) {
        this.arrows[i] = arrowTemplate.resource.instantiate();
        this.arrowsRoot.addChild(this.arrows[i]);
        this.arrows[i].enabled = true;
    }
    
    this.on("attr:pathList", function (value, prev) {
        if (value)
            onEnable();
    });
        
    // Caching some Vec3 objects that will be used in the update loop continously 
    // so we don't keep triggering the garbage collector
    this.lookAt = new pc.Vec3();
    this.up = new pc.Vec3();
    
    this.on("enable", onEnable);
    this.on("disable", onDisable);
    
    onEnable();
};

Conveyor.prototype.reset = function () {
    this.time = pc.math.clamp(this.startTime, 0, this.duration);
};

Conveyor.prototype.doRayCast = function (rayZ) {
    var playerPos = this.player.getPosition(),
        rayStart = new pc.Vec3(playerPos.x + 2, playerPos.y, rayZ),
        rayEnd = new pc.Vec3(60 + playerPos.x, playerPos.y, rayZ);

    return pc.app.systems.rigidbody.raycastFirst(rayStart, rayEnd);
};

Conveyor.prototype.testRoute = function (ovCar, ovSign, raycastResults) {
    var ovCarPos = ovCar.getPosition(),
        nearestRes = raycastResults[ovCar.laneIndex - ovSign];
    
    if (!nearestRes)
        return true;
    
    return tr.Utils.isOutOfRange(ovCarPos.x - 10, ovCarPos.x + 10, nearestRes.entity.getPosition().x);
};

Conveyor.prototype.getNextOvCar = function (raycastResults) {
    var ovCar,
        i;
    
    for (i = 0; i < tr.Config.LANES_Z.length; i++) {
        if (!raycastResults[i])
            continue;
        
        if (!ovCar || ovCar.getPosition().x > raycastResults[i].entity.getPosition().x) {
            if (ovCar == raycastResults[i].entity) {
                raycastResults[i] = null;
            } else {              
                ovCar = raycastResults[i].entity;
                ovCar.laneIndex = i;
            }
        }
    }
    
    return ovCar;
};

Conveyor.prototype.updatePath = function () {
    var curveMode = pc.CURVE_CARDINAL,
        playerPos = this.player.getPosition(),
        timeObj = {timeScale: this.app.timeScale},
        raycastResults = [],
        routeIsGood,
        ovSign,
        ovCar,
        ovCarPos,
        rayZ,
        i;
    
    for (i = 0; i < tr.Config.LANES_Z.length; i++) {
        rayZ = tr.Config.LANES_Z[i];
        raycastResults[i] = this.doRayCast(rayZ);
        
        if (!raycastResults[i] && i < tr.Config.LANES_Z.length - 1)
            raycastResults[i] = this.doRayCast(rayZ - this.LANE_HALF_WIDTH);
    }
    
    while (raycastResults.length) {
        ovCar = this.getNextOvCar(raycastResults);

        if (!ovCar)
            break;
            
        ovCarPos = ovCar.getPosition();
        ovSign = ovCarPos.z > 0 ? -1 : 1;
        routeIsGood = this.testRoute(ovCar, ovSign, raycastResults);

        if (!routeIsGood && tr.Utils.isInRange(1, 2, ovCar.laneIndex)) {
            ovSign *= -1;
            routeIsGood = this.testRoute(ovCar, ovCar.laneIndex, ovSign, raycastResults);
        }

        if (!routeIsGood)
            raycastResults[ovCar.laneIndex] = null;
        else
            break;
    }
    
    this.arrowsRoot.enabled = !!ovCar;
    
    if (tr.Storage.gameState == tr.Keys.GAME_STATES.ACTIVE) {
        
        if (ovCar && playerPos.distance(ovCarPos) < this.SLOW_MO_DIST && 
            this.SLOW_MO_RATIO < this.app.timeScale && (!this.timescaleAnimation || !this.timescaleAnimation.playing))
            this.timescaleAnimation = this.entity
                    .tween(timeObj)
                    .to({timeScale: this.SLOW_MO_RATIO}, this.SLOW_MO_TRANSITION, pc.Linear)
                    .on('update', function () {
                            if (tr.Storage.gameState != tr.Keys.GAME_STATES.ACTIVE) {
                                this.stop();
                                return;
                            }

                            pc.app.timeScale = timeObj.timeScale;
                        })
                    .start();
        else if ((!ovCar || playerPos.distance(ovCarPos) >= this.SLOW_MO_DIST) && 
                 this.app.timeScale < 1 && this.timescaleAnimation && !this.timescaleAnimation.playing)
            this.timescaleAnimation = this.entity
                    .tween(timeObj)
                    .to({timeScale: 1}, this.SLOW_MO_TRANSITION, pc.Linear)
                    .on('update', function () {
                            if (tr.Storage.gameState != tr.Keys.GAME_STATES.ACTIVE) {
                                this.stop();
                                return;
                            }

                            pc.app.timeScale = timeObj.timeScale;
                        })
                    .start();
    }
    
    if (!ovCar)
        return false;
    
    // Create curves for position
    this.px = new pc.Curve(); 
    this.px.type = curveMode;
    
    this.py = new pc.Curve(); 
    this.py.type = curveMode;    
    
    this.pz = new pc.Curve(); 
    this.pz.type = curveMode;
    
    // Create curves for target look at position
    this.tx = new pc.Curve();
    this.tx.type = curveMode;
    
    this.ty = new pc.Curve();
    this.ty.type = curveMode;
    
    this.tz = new pc.Curve();
    this.tz.type = curveMode;
    
    // Create curves for the 'up' vector for use with the lookAt function to 
    // allow for roll and avoid gimbal lock
    this.ux = new pc.Curve();
    this.ux.type = curveMode;
    
    this.uy = new pc.Curve();
    this.uy.type = curveMode;
    
    this.uz = new pc.Curve();
    this.uz.type = curveMode;
    
    var nodes = this.pathRoot.children,
        zOffset = (ovCar.collision.halfExtents.z + tr.Config.OVERTAKE_INT_TUTORIAL + this.ARROW_INTERVAL) * ovSign;
    
    nodes[3].setPosition(ovCarPos.x + this.ARROW_DIST, 0, ovCarPos.z + zOffset);
    nodes[2].setPosition(ovCarPos.x - ovCar.collision.halfExtents.x, 0, ovCarPos.z + zOffset);
    nodes[1].setPosition(playerPos.x + 1, 0, playerPos.z);
    nodes[0].setPosition(playerPos.x, 0, playerPos.z);

    nodes[1].lookAt(nodes[2].getPosition());
    nodes[1].rotate(0, 90, 0);
    
    
    // Get the total linear distance of the path (this isn't correct but gives a decent approximation in length)
    var pathLength = 0;
    
    // Store the distance from the start of the path for each path node
    //var nodePathLength = [];
    
    // For use when calculating the distance between two nodes on the path
    var distanceBetween = new pc.Vec3();
    
    // Push 0 as we are starting our loop from 1 for ease
    //nodePathLength.push(0);
    
    for (i = 1; i < nodes.length; i++) {
        var prevNode = nodes[i-1];
        var nextNode = nodes[i];
        
        // Work out the distance between the current node and the one before in the path
        distanceBetween.sub2(prevNode.getPosition(), nextNode.getPosition());
        pathLength += distanceBetween.length();
        
        //nodePathLength.push(pathLength);
    }
        
    for (i = 0; i < nodes.length; i++) {
        // Calculate the time for the curve key based on the distance of the path to the node
        // and the total path length so the speed of the camera travel stays relatively
        // consistent throughout
        //var t = nodePathLength[i] / pathLength;
        
        var t = (i + 1) / nodes.length;
        
        var node = nodes[i];
        
        var pos = node.getPosition();
        this.px.add(t, pos.x);
        this.py.add(t, pos.y);
        this.pz.add(t, pos.z);
        
        // Create and store a lookAt position based on the node position and the forward direction
        var lookAt = pos.clone().add(node.forward);
        this.tx.add(t, lookAt.x);
        this.ty.add(t, lookAt.y);
        this.tz.add(t, lookAt.z);
        
        var up = node.up;
        this.ux.add(t, up.x);
        this.uy.add(t, up.y);
        this.uz.add(t, up.z);
    }
    
    return true;
};

// update code called every frame
Conveyor.prototype.update = function(dt) {    
    if (!this.updatePath())
        return;
        
    this.time += dt;

    // loop play
    if (this.time > this.duration) {
        this.reset();
        return;
    }
    
    var percent = this.time / this.duration,
        step = 1 / this.arrows.length,
        arrowPercent,
        arrow,
        i;
    
    for (i = 0; i < this.arrows.length; i++) {
        arrow = this.arrows[i];
        
        // Work out how far we are in time we have progressed along the path
        arrowPercent = (percent + i * step) % 1;

        // Get the interpolated values for the position from the curves     
        arrow.setPosition(this.px.value(arrowPercent), this.py.value(arrowPercent), this.pz.value(arrowPercent));

        // Get the interpolated values for the look at point from the curves 
        this.lookAt.set(this.tx.value(arrowPercent), this.ty.value(arrowPercent), this.tz.value(arrowPercent));

        // Get the interpolated values for the up vector from the curves     
        this.up.set(this.ux.value(arrowPercent), this.uy.value(arrowPercent), this.uz.value(arrowPercent));

        // Make the camera look at the interpolated target position with the correct
        // up direction to allow for camera roll and to avoid glimbal lock
        arrow.lookAt(this.lookAt, this.up);
    }
};

// blobLight.js
var BlobLight = pc.createScript("blobLight");

BlobLight.attributes.add("asset", {
    type: "asset",
    assetType: "texture"
});

BlobLight.attributes.add("scale", {
    type: "number",
    default: 1
});

BlobLight.attributes.add("opacity", {
    type: "number",
    default: 1,
    min: 0,
    max: 1
});

/* Dynamic lighting properties */

BlobLight.attributes.add("applyDynamicScaling", {
    type: "boolean",
    default: true
});

BlobLight.attributes.add("minScale", {
    type: "number",
    default: 1
});

BlobLight.attributes.add("maxScale", {
    type: "number",
    default: 5
});

BlobLight.attributes.add("disappearingDistance", {
    type: "number",
    default: 5
});

BlobLight.attributes.add("minDistance", {
    type: "number",
    default: 6
});

BlobLight.attributes.add("maxDistance", {
    type: "number",
    default: 160
});

BlobLight.attributes.add("appearingDistance", {
    type: "number",
    default: 290
});
/* Dynamic lighting properties end */


BlobLight.prototype.initialize = function() {
    var self = this,
        
        loadTexture = function (flareModel) {
            self.entity.model.model = flareModel.clone();
            
            self.modelGraph = self.entity.model.model.graph;
    
            if (self.textureAsset.resource) {
                self.setTexture(self.textureAsset.resource);
            } else {
                self.textureAsset.once("load", function(t) {
                    self.setTexture(t.resource);
                    self.entity.fire("texture");
                });

                if(!self.textureAsset) console.warn('No texture assigned to blobLight on entity ', self.entity.parent);
                self.app.assets.load(self.textureAsset);
            }
        };

    this.texture = null;
    
    if (!this.asset)
        return;
    
    this.topologyYSlope = this.app.graphicsDevice.scope.resolve("topologyYSlope");
    this.topologyZSlope = this.app.graphicsDevice.scope.resolve("topologyZSlope");
    
    this.textureAsset = this.asset;
    
    tr.Storage.getFlareModel().then(loadTexture);
    
    this.on('attr', function () {
        if (!this.modelGraph)
            return;
        
        this.entity.model.model.meshInstances[0].setParameter("opacity", this.opacity);
        this.entity.model.model.meshInstances[0].setParameter("scale", this.scale);
    }.bind(this));
};

BlobLight.prototype.setTexture = function(t) {
    this.texture = t;
    this.entity.model.model.meshInstances[0].setParameter("texture_diffuseMap", this.texture);
    this.entity.model.model.meshInstances[0].setParameter("opacity", this.opacity);
    this.entity.model.model.meshInstances[0].setParameter("scale", this.scale);
};

BlobLight.prototype.update = function(t) {
    if (!this.modelGraph)
        return;
    
    var pos = this.entity.getPosition(),
        vOffset = Math.pow(pos.x, 2);

    this.modelGraph.setPosition(pos.x, 
                                pos.y + this.topologyYSlope.getValue() * vOffset, 
                                pos.z + this.topologyZSlope.getValue() * vOffset);
    
    /* === dynamic lightning implementation === */
    if(this.applyDynamicScaling) {
        
        const worldPosition = pos; 
        if(worldPosition.x > this.appearingDistance) {
            /* too far,  hide the blob  */
            scaleFactor = 0;
            
        } else if(worldPosition.x > this.maxDistance) {
            /* smoothly appear */
            scaleFactor = (1 - (worldPosition.x - this.maxDistance) / (this.appearingDistance - this.maxDistance) ) * this.maxScale;
            
        } else if(worldPosition.x < this.disappearingDistance) {
            /* too close, hide the blob */
            scaleFactor = 0;
            
        }  else if(worldPosition.x < this.minDistance) {
            /* smoothly disappear */
            scaleFactor = (worldPosition.x - this.disappearingDistance) / (this.minDistance - this.disappearingDistance) * this.minScale;

        }   else {
            /* lerp scale accordingly to distance to it */
            scaleFactor = pc.math.clamp((worldPosition.x - this.minDistance) / (this.maxDistance - this.minDistance), 0, 1);
            scaleFactor = pc.math.lerp(this.minScale, this.maxScale, scaleFactor);
        }
        
        /* calculate final scale */
        let targetScale = this.scale * scaleFactor;
        
        /* apply dynamic scaling */
        this.entity.model.model.meshInstances[0].setParameter("scale", targetScale);
    }
    /* === dynamic lightning implementation end === */
    
    
};

// AssetsLoader.js
/* jshint esversion: 6 */
var AssetsLoader = pc.createScript('assetsLoader');

AssetsLoader.getInstance = function() {
    if(!AssetsLoader._instance) console.error('AssetsLoader is not initialized yet');
    return AssetsLoader._instance;
};

AssetsLoader.prototype.initialize = function() {
    AssetsLoader._app = this.app;
    if(!AssetsLoader._instance) {
        AssetsLoader._instance = this;
    }
};

AssetsLoader.prototype.loadAsset = function(asset) {
    return this._loadAssets(asset);
};

AssetsLoader.prototype.loadByTag = function(...tags) {
    const taggedAssets = this.app.assets.filter(asset => asset && asset.tags.has(...tags));
    return this._loadAssets(...taggedAssets);
};

AssetsLoader.prototype._loadAssets = function(...assets) {
      return new Promise((resolve, reject) => {
          
        const pendingAssets = assets.filter(asset => asset && !asset.loaded);
          
        if (pendingAssets.length === 0) return resolve(0);
          
        let assetsLeft = pendingAssets.length;
        
        famobi.log(`Preloading ${assetsLeft} assets...`);
        
        const assetTaskFinished = () => {
            assetsLeft -= 1;
            
            if (assetsLeft === 0)
                resolve(pendingAssets.length);
        };
        
        pendingAssets.forEach(asset => {
            asset.once('load', assetTaskFinished);
            asset.once('error', () => {
                console.warn('Failed to load asset ' + asset.name);
                assetTaskFinished();
            });
            
            this.app.assets.load(asset);
        });
    });
};

// loadingSpinner.js
var LoadingSpinner = pc.createScript('loadingSpinner');


LoadingSpinner.attributes.add('period', {
    type: 'number',
    default: 1
});

LoadingSpinner.attributes.add('segments', {
    type: 'number',
    default: 1
});

LoadingSpinner.prototype.initialize = function() {
     this.elapsedTime = 0;
};

LoadingSpinner.prototype.update = function(dt) {
    this.elapsedTime += dt / this.period;
    this.entity.setLocalEulerAngles(0, 0, -360 / this.segments * Math.floor(this.elapsedTime % 1 * this.segments));
};




// Apicontroller.js
/* jshint esversion: 6 */
var Apicontroller = pc.createScript('apicontroller');

Apicontroller.FAMOBI_TRACKING_KEY = 'traffic-tom';

Apicontroller.prototype.initialize = function() {
    famobi.log('Famobi API controller initialized');
    
    Apicontroller.initTracking();
};

Apicontroller.prototype.update = function(dt) {
    //make sure the game is paused 
    if(this.app.applicationPaused) {
        this.app.timeScale = 0;
    }
};

Apicontroller.initTracking = function() {
    if(!window.famobi_tracking) {
        console.warn("Tracking API is not defined");
        return;
    }
    window.famobi_tracking.init(Apicontroller.FAMOBI_TRACKING_KEY, null, 100, true, true);
    console.log('Tracking API initialized with key ' + Apicontroller.FAMOBI_TRACKING_KEY);
};

Apicontroller.trackLevelStart = function(eventParams) {
    if(!window.famobi_tracking) {
        console.warn("TrackLevelStart: Tracking API is not defined");
        return;
    }
    window.famobi_tracking.trackEvent(window.famobi_tracking.EVENTS.LEVEL_START, eventParams);
};


Apicontroller.trackLevelEnd = function(eventParams) {
    if(!window.famobi_tracking) {
        console.warn("TrackLevelEnd: Tracking API is not defined");
        return;
    }
    window.famobi_tracking.trackEvent(window.famobi_tracking.EVENTS.LEVEL_END, eventParams);
};

Apicontroller.handleLevelEndEvent = function(result, score, resolveCallback) {
    if(!window.famobi) {
        resolveCallback();
        return;
    }
    
    const currentTimeScale = game.timeScale;
    game.timeScale = 0.0;    
    
    window.famobi_analytics.trackEvent("EVENT_CUSTOM", {eventName: "LEVELEND", result: result, score: score})
        .then(() => {
            game.timeScale = currentTimeScale;
            resolveCallback();
        }).catch(() => {
    
        });
};

/* Rewarded videos ads */


Apicontroller.hasRewardedVideo = function() {
    if (window.famobi && window.famobi.hasRewardedAd)
        return window.famobi.hasRewardedAd();
    else
        return false;
};

Apicontroller.showRewardedVideo = function(callback) {
    if(!window.famobi) callback({rewardGranted: false});
    
    if (window.famobi && Apicontroller.hasRewardedVideo()) {
        window.famobi.rewardedAd(callback);
    } else {
        callback({rewardGranted: false});
    }
};



/* Tracking stats */

Apicontroller.trackStats = function(...args) {
    if(window.famobi_analytics && window.famobi_analytics.trackStats) {
        window.famobi_analytics.trackStats(...args);
    }
};



// SoundController.js
var SoundController = pc.createScript('soundController');

SoundController.masterVolume = 1.0;
SoundController.apiVolumeMultiplier = 1.0;

SoundController.prototype.initialize = function() {
    this.app.on(tr.Events.SOUND_SET_MASTER_VOLUME, this.setMasterVolume, this);
    this.app.on(tr.Events.SOUND_SET_VOLUME_MULTIPLIER, this.setVolumeMultiplier, this);
    this.app.on(tr.Events.API_ENABLE_AUDIO, this.enableAudio, this);
    this.app.on(tr.Events.API_DISABLE_AUDIO, this.disableAudio, this);
    this.app.on(tr.Events.API_ENABLE_MUSIC, this.enableMusic, this);
    this.app.on(tr.Events.API_DISABLE_MUSIC, this.disableMusic, this);
    
    
    /* fetch and apply master volume */
    this.setMasterVolume(window.famobi.getVolume());
};


SoundController.prototype.enableAudio = function() {
    tr.Storage.sound.sfx = true;
    tr.SoundController.enabled = tr.Storage.sound.sfx;
};

SoundController.prototype.disableAudio = function() {
    tr.Storage.sound.sfx = false;
    tr.SoundController.enabled = tr.Storage.sound.sfx;
};

SoundController.prototype.enableMusic = function() {
    tr.Storage.sound.music = true;
    tr.MusicController.enabled = tr.Storage.sound.music;
};

SoundController.prototype.disableMusic = function() {
    tr.Storage.sound.music = false;
    tr.MusicController.enabled = tr.Storage.sound.music;
};

SoundController.prototype.updateVolume = function() {
    this.app.systems.sound.volume = SoundController.masterVolume * SoundController.apiVolumeMultiplier;
};

SoundController.prototype.setMasterVolume = function(volume) {
    SoundController.masterVolume = volume;
    this.updateVolume();
};

SoundController.prototype.setVolumeMultiplier = function(volume) {
    SoundController.apiVolumeMultiplier = volume;
    this.updateVolume();
};

// posteffect-bloom.js
//--------------- POST EFFECT DEFINITION------------------------//
pc.extend(pc, function () {
    var SAMPLE_COUNT = 15;

    function computeGaussian(n, theta) {
        return ((1.0 / Math.sqrt(2 * Math.PI * theta)) * Math.exp(-(n * n) / (2 * theta * theta)));
    }

    function calculateBlurValues(sampleWeights, sampleOffsets, dx, dy, blurAmount) {
        // Look up how many samples our gaussian blur effect supports.

        // Create temporary arrays for computing our filter settings.
        // The first sample always has a zero offset.
        sampleWeights[0] = computeGaussian(0, blurAmount);
        sampleOffsets[0] = 0;
        sampleOffsets[1] = 0;

        // Maintain a sum of all the weighting values.
        var totalWeights = sampleWeights[0];

        // Add pairs of additional sample taps, positioned
        // along a line in both directions from the center.
        var i, len;
        for (i = 0, len = Math.floor(SAMPLE_COUNT / 2); i < len; i++) {
            // Store weights for the positive and negative taps.
            var weight = computeGaussian(i + 1, blurAmount);
            sampleWeights[i*2] = weight;
            sampleWeights[i*2+1] = weight;
            totalWeights += weight * 2;

            // To get the maximum amount of blurring from a limited number of
            // pixel shader samples, we take advantage of the bilinear filtering
            // hardware inside the texture fetch unit. If we position our texture
            // coordinates exactly halfway between two texels, the filtering unit
            // will average them for us, giving two samples for the price of one.
            // This allows us to step in units of two texels per sample, rather
            // than just one at a time. The 1.5 offset kicks things off by
            // positioning us nicely in between two texels.
            var sampleOffset = i * 2 + 1.5;

            // Store texture coordinate offsets for the positive and negative taps.
            sampleOffsets[i*4] = dx * sampleOffset;
            sampleOffsets[i*4+1] = dy * sampleOffset;
            sampleOffsets[i*4+2] = -dx * sampleOffset;
            sampleOffsets[i*4+3] = -dy * sampleOffset;
        }

        // Normalize the list of sample weightings, so they will always sum to one.
        for (i = 0, len = sampleWeights.length; i < len; i++) {
            sampleWeights[i] /= totalWeights;
        }
    }

    /**
     * @name pc.BloomEffect
     * @class Implements the BloomEffect post processing effect
     * @constructor Creates new instance of the post effect.
     * @extends pc.PostEffect
     * @param {pc.GraphicsDevice} graphicsDevice The graphics device of the application
     * @property {Number} bloomThreshold Only pixels brighter then this threshold will be processed. Ranges from 0 to 1
     * @property {Number} blurAmount Controls the amount of blurring.
     * @property {Number} bloomIntensity The intensity of the effect.
     */
    var BloomEffect = function (graphicsDevice) {
        // Shaders
        var attributes = {
            aPosition: pc.SEMANTIC_POSITION
        };

        var passThroughVert = [
            "attribute vec2 aPosition;",
            "",
            "varying vec2 vUv0;",
            "",
            "void main(void)",
            "{",
            "    gl_Position = vec4(aPosition, 0.0, 1.0);",
            "    vUv0 = (aPosition + 1.0) * 0.5;",
            "}"
        ].join("\n");

        // Pixel shader extracts the brighter areas of an image.
        // This is the first step in applying a bloom postprocess.
        var bloomExtractFrag = [
            "precision " + graphicsDevice.precision + " float;",
            "",
            "varying vec2 vUv0;",
            "",
            "uniform sampler2D uBaseTexture;",
            "uniform float uBloomThreshold;",
            "",
            "void main(void)",
            "{",
                 // Look up the original image color.
            "    vec4 color = texture2D(uBaseTexture, vUv0);",
            "",
                 // Adjust it to keep only values brighter than the specified threshold.
            "    gl_FragColor = clamp((color - uBloomThreshold) / (1.0 - uBloomThreshold), 0.0, 1.0);",
            "}"
        ].join("\n");

        // Pixel shader applies a one dimensional gaussian blur filter.
        // This is used twice by the bloom postprocess, first to
        // blur horizontally, and then again to blur vertically.
        var gaussianBlurFrag = [
            "precision " + graphicsDevice.precision + " float;",
            "",
            "#define SAMPLE_COUNT " + SAMPLE_COUNT,
            "",
            "varying vec2 vUv0;",
            "",
            "uniform sampler2D uBloomTexture;",
            "uniform vec2 uBlurOffsets[SAMPLE_COUNT];",
            "uniform float uBlurWeights[SAMPLE_COUNT];",
            "",
            "void main(void)",
            "{",
            "    vec4 color = vec4(0.0);",
                 // Combine a number of weighted image filter taps.
            "    for (int i = 0; i < SAMPLE_COUNT; i++)",
            "    {",
            "        color += texture2D(uBloomTexture, vUv0 + uBlurOffsets[i]) * uBlurWeights[i];",
            "    }",
            "",
            "    gl_FragColor = color;",
            "}"
        ].join("\n");

        // Pixel shader combines the bloom image with the original
        // scene, using tweakable intensity levels.
        // This is the final step in applying a bloom postprocess.
        var bloomCombineFrag = [
            "precision " + graphicsDevice.precision + " float;",
            "",
            "varying vec2 vUv0;",
            "",
            "uniform float uBloomEffectIntensity;",
            "uniform sampler2D uBaseTexture;",
            "uniform sampler2D uBloomTexture;",
            "",
            "void main(void)",
            "{",
                 // Look up the bloom and original base image colors.
            "    vec4 bloom = texture2D(uBloomTexture, vUv0) * uBloomEffectIntensity;",
            "    vec4 base = texture2D(uBaseTexture, vUv0);",
            "",
                 // Darken down the base image in areas where there is a lot of bloom,
                 // to prevent things looking excessively burned-out.
            "    base *= (1.0 - clamp(bloom, 0.0, 1.0));",
            "",
                 // Combine the two images.
            "    gl_FragColor = base + bloom;",
            "}"
        ].join("\n");

        this.extractShader = new pc.Shader(graphicsDevice, {
            attributes: attributes,
            vshader: passThroughVert,
            fshader: bloomExtractFrag
        });
        this.blurShader = new pc.Shader(graphicsDevice, {
            attributes: attributes,
            vshader: passThroughVert,
            fshader: gaussianBlurFrag
        });
        this.combineShader = new pc.Shader(graphicsDevice, {
            attributes: attributes,
            vshader: passThroughVert,
            fshader: bloomCombineFrag
        });

        // Render targets
        var width = graphicsDevice.width;
        var height = graphicsDevice.height;
        this.targets = [];
        for (var i = 0; i < 2; i++) {
            var colorBuffer = new pc.Texture(graphicsDevice, {
                format: pc.PIXELFORMAT_R8_G8_B8_A8,
                width: width >> 1,
                height: height >> 1
            });
            colorBuffer.minFilter = pc.FILTER_LINEAR;
            colorBuffer.magFilter = pc.FILTER_LINEAR;
            colorBuffer.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
            colorBuffer.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
            var target = new pc.RenderTarget(graphicsDevice, colorBuffer, { depth: false });

            this.targets.push(target);
        }

        // Effect defaults
        this.bloomThreshold = 0.25;
        this.blurAmount = 4;
        this.bloomIntensity = 1.25;

        // Uniforms
        this.sampleWeights = new Float32Array(SAMPLE_COUNT);
        this.sampleOffsets = new Float32Array(SAMPLE_COUNT * 2);
    }

    BloomEffect = pc.inherits(BloomEffect, pc.PostEffect);

    BloomEffect.prototype = pc.extend(BloomEffect.prototype, {
        render: function (inputTarget, outputTarget, rect) {
            var device = this.device;
            var scope = device.scope;

            // Pass 1: draw the scene into rendertarget 1, using a
            // shader that extracts only the brightest parts of the image.
            scope.resolve("uBloomThreshold").setValue(this.bloomThreshold);
            scope.resolve("uBaseTexture").setValue(inputTarget.colorBuffer);
            pc.drawFullscreenQuad(device, this.targets[0], this.vertexBuffer, this.extractShader);

            // Pass 2: draw from rendertarget 1 into rendertarget 2,
            // using a shader to apply a horizontal gaussian blur filter.
            calculateBlurValues(this.sampleWeights, this.sampleOffsets, 1.0 / this.targets[1].width, 0, this.blurAmount);
            scope.resolve("uBlurWeights[0]").setValue(this.sampleWeights);
            scope.resolve("uBlurOffsets[0]").setValue(this.sampleOffsets);
            scope.resolve("uBloomTexture").setValue(this.targets[0].colorBuffer);
            pc.drawFullscreenQuad(device, this.targets[1], this.vertexBuffer, this.blurShader);

            // Pass 3: draw from rendertarget 2 back into rendertarget 1,
            // using a shader to apply a vertical gaussian blur filter.
            calculateBlurValues(this.sampleWeights, this.sampleOffsets, 0, 1.0 / this.targets[0].height, this.blurAmount);
            scope.resolve("uBlurWeights[0]").setValue(this.sampleWeights);
            scope.resolve("uBlurOffsets[0]").setValue(this.sampleOffsets);
            scope.resolve("uBloomTexture").setValue(this.targets[1].colorBuffer);
            pc.drawFullscreenQuad(device, this.targets[0], this.vertexBuffer, this.blurShader);

            // Pass 4: draw both rendertarget 1 and the original scene
            // image back into the main backbuffer, using a shader that
            // combines them to produce the final bloomed result.
            scope.resolve("uBloomEffectIntensity").setValue(this.bloomIntensity);
            scope.resolve("uBloomTexture").setValue(this.targets[0].colorBuffer);
            scope.resolve("uBaseTexture").setValue(inputTarget.colorBuffer);
            pc.drawFullscreenQuad(device, outputTarget, this.vertexBuffer, this.combineShader, rect);
        }
    });

    return {
        BloomEffect: BloomEffect
    };
}());

//--------------- SCRIPT DEFINITION------------------------//
var Bloom = pc.createScript('bloom');

Bloom.attributes.add('bloomIntensity', {
    type: 'number',
    default: 1,
    min: 0,
    title: 'Intensity'
});

Bloom.attributes.add('bloomThreshold', {
    type: 'number',
    default: 0.25,
    min: 0,
    max: 1,
    precision: 2,
    title: 'Threshold'
});

Bloom.attributes.add('blurAmount', {
    type: 'number',
    default: 4,
    min: 1,
    'title': 'Blur amount'
});

Bloom.prototype.initialize = function() {
    this.effect = new pc.BloomEffect(this.app.graphicsDevice);

    this.effect.bloomThreshold = this.bloomThreshold;
    this.effect.blurAmount = this.blurAmount;
    this.effect.bloomIntensity = this.bloomIntensity;

    var queue = this.entity.camera.postEffects;

    queue.addEffect(this.effect);

    this.on('attr', function (name, value) {
        this.effect[name] = value;
    }, this);

    this.on('state', function (enabled) {
        if (enabled) {
            queue.addEffect(this.effect);
        } else {
            queue.removeEffect(this.effect);
        }
    });

    this.on('destroy', function () {
        queue.removeEffect(this.effect);
    });
};


// brandingImage.js
var BrandingImage = pc.createScript('brandingImage');


BrandingImage.prototype.initialize = function() {
    
    this.entity.element.opacity = 0.0;
    
    if(window.famobi) {
        
        var self = this;
        this.app.loader.getHandler("texture").crossOrigin = "anonymous";

        var asset = new pc.Asset("brandingImage", "texture", {
            url: window.famobi.getBrandingButtonImage()
        });

        this.app.assets.add(asset);

        asset.on("error", function (message) {
            famobi.log("Branding image loading failed: ", message);
        });

        asset.on("load", function (asset) {
            var material = self.entity.element.texture = asset.resource;
            self.entity.element.opacity = 1;
            self.assignAction(self.entity, self.brandingPressed, self);
        });

        this.app.assets.load(asset);
    }
};

BrandingImage.prototype.assignAction = function(button, handler, handlerContext) {
     if(this.app.touch) {
         button.element.on('touchstart', handler, handlerContext);
     } 
     if(this.app.mouse) {
          button.element.on('mousedown', handler, handlerContext);
     }
};

BrandingImage.prototype.update = function(dt) {
    const screenRatio = this.app.graphicsDevice.width /  this.app.graphicsDevice.height;
    if(screenRatio < 0.75) {
        this.entity.element.anchor.set(0.5, 1, 0.5, 1);
        this.entity.setLocalPosition(0, -250, 0);
    } else {
        this.entity.element.anchor.set(0, 1, 0, 1);
        this.entity.setLocalPosition(200, -100, 0);
    }
};

BrandingImage.prototype.swap = function(data) {

};

BrandingImage.prototype.brandingPressed = function() {
    if(window.famobi) {
        window.famobi.openBrandingLink();
    }
};


// copyrightText.js
var CopyrightText = pc.createScript('copyrightText');

CopyrightText.prototype.initialize = function() {
    this.entity.enabled = isCopyrightEnabled();
};

CopyrightText.prototype.update = function(dt) {
    
};


// adaptive-splitscreen.js
var AdaptiveSplitscreen = pc.createScript('adaptiveSplitscreen');

AdaptiveSplitscreen.attributes.add('animationScene', {
    type: 'entity',
    description: 'Animation scene'
});

AdaptiveSplitscreen.attributes.add('camera', {
    type: 'entity',
    description: 'Ortho camera'
});

// initialize code called once per entity
AdaptiveSplitscreen.prototype.initialize = function() {
    var animationAABB = tr.Utils.getAABB(this.animationScene),
        
        onCanvasResize = function (e) {
            var ratio = pc.app.graphicsDevice.width / pc.app.graphicsDevice.height,
                orthoHeight = this.camera.camera.orthoHeight,
                orthoWidth = orthoHeight * ratio,
                scale = Math.min(orthoWidth / (animationAABB.halfExtents.x * 0.5), 1);
            
            this.animationScene.setLocalScale(scale, scale, scale);
            this.animationScene.setLocalPosition(0, -orthoHeight * (1 - scale), 0);
        }.bind(this);
    
    this.camera.camera.orthoHeight = animationAABB.halfExtents.y;
    
    this.app.graphicsDevice.on('resizecanvas', onCanvasResize);
    
    onCanvasResize();
};


// garage-music.js
var GarageMusic = pc.createScript('garageMusic');

// initialize code called once per entity
GarageMusic.prototype.initialize = function() {
    var play = function () {
            tr.MusicController.stop(tr.Keys.SOUNDS.GARAGE_LOOP);
            tr.MusicController.stop(tr.Keys.SOUNDS.GARAGE_INTRO);
            tr.MusicController.play(tr.Keys.SOUNDS.GARAGE_INTRO);
        }.bind(this),
        
        onMusicEnd = function (slot, instance) {
            if (slot.name == tr.Keys.SOUNDS.GARAGE_INTRO)
                tr.MusicController.play(tr.Keys.SOUNDS.GARAGE_LOOP);
        }.bind(this);
    
    tr.MusicController.on('end', onMusicEnd);
    
    this.on('enable', play);
    
    this.app.on(tr.Events.SOUND_MUSIC, play);
    
    play();
};

