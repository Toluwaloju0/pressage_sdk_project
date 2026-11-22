// Choices for the profile form. The `value`s must match the allowed values in
// backend/app/schemas.py (the Literal types). Change both together.

export const GENDER = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
]

export const LOCATION_TYPE = [
  { value: 'rural', label: 'Rural (village or countryside)' },
  { value: 'semi_urban', label: 'Semi-urban (small town or edge of a city)' },
  { value: 'urban', label: 'Urban (city)' },
]

export const HOUSING_TYPE = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment or flat' },
  { value: 'shared_home', label: 'Shared home or room' },
  { value: 'other', label: 'Something else' },
]

export const CLIMATE = [
  { value: 'hot_humid', label: 'Hot and humid' },
  { value: 'hot_dry', label: 'Hot and dry' },
  { value: 'temperate', label: 'Mild' },
  { value: 'cold', label: 'Cold' },
  { value: 'varies', label: 'Changes a lot through the year' },
]

export const AIR_QUALITY = [
  { value: 'clean', label: 'Clean air' },
  { value: 'some_pollution', label: 'Some smoke, traffic or dust' },
  { value: 'heavy_pollution', label: 'Heavy smoke, traffic or dust' },
]

export const SAFE_WATER = [
  { value: 'always', label: 'Always' },
  { value: 'usually', label: 'Usually' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'rarely', label: 'Rarely' },
]

export const ASSOCIATES = [
  { value: 'family', label: 'Family' },
  { value: 'close_friends', label: 'Close friends' },
  { value: 'coworkers', label: 'Coworkers' },
  { value: 'classmates', label: 'Classmates' },
  { value: 'faith_or_community', label: 'A faith or community group' },
  { value: 'neighbours', label: 'Neighbours' },
  { value: 'mostly_alone', label: 'Mostly on my own' },
]

export const SOCIAL_SUPPORT = [
  { value: 'strong', label: 'Strong: several people I can rely on' },
  { value: 'some', label: 'Some: one or two people' },
  { value: 'limited', label: 'Limited' },
  { value: 'none', label: 'No one right now' },
]

export const WORK_TYPE = [
  { value: 'desk', label: 'Desk or computer work' },
  { value: 'on_feet', label: 'On my feet or physical work' },
  { value: 'shift', label: 'Shift or night work' },
  { value: 'student', label: 'Student' },
  { value: 'not_working', label: 'Not working right now' },
  { value: 'other', label: 'Something else' },
]

export const ADAPTABILITY = [
  { value: '1', label: '1: Change is hard for me and I need a lot of time' },
  { value: '2', label: '2: I take a while to get used to change' },
  { value: '3', label: '3: It depends on the change' },
  { value: '4', label: '4: I adapt fairly quickly' },
  { value: '5', label: '5: I adapt very quickly' },
]

export const STRESS = [
  { value: '1', label: '1: Very low' },
  { value: '2', label: '2: Low' },
  { value: '3', label: '3: Moderate' },
  { value: '4', label: '4: High' },
  { value: '5', label: '5: Very high' },
]

export const DIET = [
  { value: 'home_cooked', label: 'Mostly home-cooked meals' },
  { value: 'takeaway_fast_food', label: 'Often takeaway or fast food' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian (fish but no meat)' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
]

export const TOBACCO = [
  { value: 'never', label: 'Never' },
  { value: 'former', label: 'I used to' },
  { value: 'occasional', label: 'Sometimes' },
  { value: 'daily', label: 'Every day' },
]

export const ALCOHOL = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'weekly', label: 'Most weeks' },
  { value: 'most_days', label: 'Most days' },
]
