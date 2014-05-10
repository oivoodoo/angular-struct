(function () {
  angular.module('struct', []).value('version', '0.0.1');
}.call(this));
;
(function () {
  var __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
      for (var key in parent) {
        if (__hasProp.call(parent, key))
          child[key] = parent[key];
      }
      function ctor() {
        this.constructor = child;
      }
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      child.__super__ = parent.prototype;
      return child;
    };
  admin.factory('BaseCollection', [
    'uuid4',
    '$rootScope',
    '$timeout',
    'EventEmitter',
    function (uuid, $rootScope, $timeout, EventEmitter) {
      var BaseCollection;
      return BaseCollection = function (_super) {
        __extends(BaseCollection, _super);
        function BaseCollection(values, model) {
          var _this = this;
          this.model = model;
          values || (values = []);
          _.map(values, function (attributes) {
            return _this.push(new _this.model(_this, attributes));
          });
          this._id = uuid.generate().replace(/-/g, '');
          this._subscriptions = new EventEmitter(this);
          angular.extend(this, this._subscriptions.publicMethods);
        }
        BaseCollection.prototype.add = function (attributes) {
          var model, _this = this;
          if (attributes == null) {
            attributes = '{}';
          }
          model = new this.model(this, JSON.parse(attributes));
          this.push(model);
          return $timeout(function () {
            _this._subscriptions.attach(model);
            return _this._subscriptions.emit('add', model);
          });
        };
        BaseCollection.prototype.remove = function (model) {
          var _this = this;
          _.remove(this, model);
          return $timeout(function () {
            _this._subscriptions.emit('destroy', model);
            return _this._subscriptions.deattach(model);
          });
        };
        BaseCollection.prototype.count = function () {
          return _.filter(this, function (value) {
            return value._destroy !== 1;
          }).length;
        };
        BaseCollection.prototype.toString = function () {
          return 'BaseCollection:' + this._id;
        };
        return BaseCollection;
      }(Array);
    }
  ]);
}.call(this));
(function () {
  admin.factory('BaseModel', [
    'uuid4',
    function (uuid) {
      var BaseModel;
      return BaseModel = function () {
        BaseModel.prototype.newRecord = true;
        BaseModel.prototype._destroy = 0;
        function BaseModel(storage, attributes) {
          this.storage = storage;
          if (attributes == null) {
            attributes = null;
          }
          if (attributes != null) {
            angular.extend(this, attributes, { newRecord: attributes._id == null });
          }
          if (this.newRecord) {
            this._id = uuid.generate().replace(/-/g, '');
          }
          this.baseIndex = this._id;
        }
        BaseModel.prototype.isDestroyed = function () {
          return this._destroy === 1;
        };
        BaseModel.prototype.remove = function () {
          if (this.newRecord) {
            this.storage.remove(this);
          }
          return this._destroy = 1;
        };
        BaseModel.prototype.toString = function () {
          return this._id;
        };
        return BaseModel;
      }();
    }
  ]);
}.call(this));
(function () {
  var __bind = function (fn, me) {
    return function () {
      return fn.apply(me, arguments);
    };
  };
  admin.factory('EventEmitter', [
    '$rootScope',
    function ($rootScope) {
      var EventEmitter;
      return EventEmitter = function () {
        function EventEmitter(base, _subscriptions) {
          this.base = base;
          this._subscriptions = _subscriptions != null ? _subscriptions : {};
          this.on = __bind(this.on, this);
          this.emit = __bind(this.emit, this);
          this.publicMethods = { on: this.on };
        }
        EventEmitter.prototype.emit = function (type, model) {
          return $rootScope.$emit(this.eventKey(model, type), model);
        };
        EventEmitter.prototype.on = function (type, callback) {
          var model, _base, _i, _len, _ref, _results;
          if ((_base = this._subscriptions)[type] == null) {
            _base[type] = {
              callbacks: [],
              models: {}
            };
          }
          this._subscriptions[type].callbacks.push(callback);
          _ref = this.base;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            model = _ref[_i];
            _results.push(this.one(model, type, callback));
          }
          return _results;
        };
        EventEmitter.prototype.attach = function (model) {
          var callback, settings, type, _ref, _results;
          _ref = this._subscriptions;
          _results = [];
          for (type in _ref) {
            settings = _ref[type];
            _results.push(function () {
              var _i, _len, _ref1, _results1;
              _ref1 = settings.callbacks;
              _results1 = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                callback = _ref1[_i];
                _results1.push(this.one(model, type, callback));
              }
              return _results1;
            }.call(this));
          }
          return _results;
        };
        EventEmitter.prototype.deattach = function (model) {
          var type, _, _ref, _results;
          _ref = this._subscriptions;
          _results = [];
          for (type in _ref) {
            _ = _ref[type];
            _results.push(this.off(model, type));
          }
          return _results;
        };
        EventEmitter.prototype.one = function (model, type, callback) {
          var unbind, _base, _name;
          unbind = $rootScope.$on(this.eventKey(model, type), callback);
          (_base = this._subscriptions[type].models)[_name = model.toString()] || (_base[_name] = { bindings: [] });
          return this._subscriptions[type].models[model.toString()].bindings.push(unbind);
        };
        EventEmitter.prototype.off = function (model, type) {
          var bindings, unbind, _i, _len, _results;
          bindings = this._subscriptions[type].models[model.toString()].bindings;
          _results = [];
          for (_i = 0, _len = bindings.length; _i < _len; _i++) {
            unbind = bindings[_i];
            _results.push(unbind());
          }
          return _results;
        };
        EventEmitter.prototype.eventKey = function (model, type) {
          return '' + this.base.toString() + ':' + type + ':' + model.toString();
        };
        return EventEmitter;
      }();
    }
  ]);
}.call(this));