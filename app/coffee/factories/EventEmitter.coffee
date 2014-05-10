admin.factory 'EventEmitter', ['$rootScope', ($rootScope) ->
    class EventEmitter
        constructor: (@base, @_subscriptions = {}) ->
            @publicMethods =
                on: @on

        emit: (type, model) =>
            $rootScope.$emit(@eventKey(model, type), model)

        on: (type, callback) =>
            # override any subscriptions for the same collection.
            @_subscriptions[type] ?=
                callbacks : []
                models    : {}
            @_subscriptions[type].callbacks.push(callback)

            for model in @base
                @one(model, type, callback)

        attach: (model) ->
            for type, settings of @_subscriptions
                for callback in settings.callbacks
                    @one(model, type, callback)

        deattach: (model) ->
            for type, _ of @_subscriptions
                @off(model, type)

        one: (model, type, callback) ->
            unbind = $rootScope.$on(@eventKey(model, type), callback)
            @_subscriptions[type].models[model.toString()] or=
                bindings : []
            @_subscriptions[type].models[model.toString()].bindings.push(unbind)

        off: (model, type) ->
            bindings = @_subscriptions[type].models[model.toString()].bindings
            for unbind in bindings
                unbind()

        eventKey: (model, type) ->
            "#{@base.toString()}:#{type}:#{model.toString()}"
]
