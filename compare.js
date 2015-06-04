###
-- Fat arrow
###

[0, 1, 2].map (val) => (val * val)

###
-- Class
###

class Rectangle
  constructor: (width, height) ->
    @width = width
    @height = height

  area: ->
    @width * @height

  @area: (width, height) ->
    new Rectangle(width, height).area()

class Square extends Rectangle
  constructor: (side) ->
    super(side, side)

###
-- Object literals
###

shorthand = 'foo'
obj =
  shorthand # short for shorthand: shorthand
  method: -> undefined
obj['expr' + 'ession'] = true

###
-- Template strings
###

"Hello #{name}"

###
-- Destructured assignment
###

a, b, c = [1, 2, 3]

###
-- Default arguments
###

f = (a, b, c = 1) ->
  a + b + c

###
-- Splats
###

s = (a, args...) ->
  a * args.length

s(1, [2, 3, 4, 5]...)

###
-- Iteration
###

for n in [1, 2, 3]
  console.log i

for n, i in [1, 4, 9]
  console.log i, n
