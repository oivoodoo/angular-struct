admin.factory 'BaseModel', ['uuid4', (uuid) ->
    # Example:
    #
    # class Item extends BaseModel
    #   title: ""
    #
    class BaseModel
        newRecord : true
        _destroy  : 0

        constructor: (@storage, attributes = null) ->
            if attributes?
                angular.extend(@, attributes, newRecord: !attributes._id?)

            if @newRecord
                @_id = uuid.generate().replace(/-/g,'')

            @baseIndex = @_id

        isDestroyed: ->
            @_destroy is 1

        remove: ->
            if @newRecord
                @storage.remove(@)
            @_destroy = 1

        toString: ->
            @_id
]
