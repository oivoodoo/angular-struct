admin.factory 'BaseCollection', [
    'uuid4', '$rootScope', '$timeout', 'EventEmitter'
    (uuid, $rootScope, $timeout, EventEmitter) ->
        # Example:
        #
        # class ItemsCollection extends BaseCollection
        #
        class BaseCollection extends Array
            # super method should receive model class for creating on push new item.
            constructor: (values, @model) ->
                values or= []

                _.map values, (attributes) =>
                    @push(new @model(@, attributes))

                @_id = uuid.generate().replace(/-/g,'')
                @_subscriptions = new EventEmitter(@)

                # Simulate delegator approach for EventEmitter
                angular.extend @, @_subscriptions.publicMethods

            add: (attributes = "{}") ->
                model = new @model(@, JSON.parse(attributes))
                @push(model)

                $timeout =>
                    @_subscriptions.attach(model)
                    @_subscriptions.emit('add', model)

            remove: (model) ->
                _.remove(@, model)

                $timeout =>
                    @_subscriptions.emit('destroy', model)
                    @_subscriptions.deattach(model)

            count: ->
                _.filter(@, (value) -> value._destroy isnt 1).length

            toString: ->
                "BaseCollection:#{@_id}"
]
