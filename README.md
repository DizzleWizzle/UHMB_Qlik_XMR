# UHMB Qlik XMr chart
XMr SPC Chart Qlik Sense visualisation extension built in house at University Hospitals of Morecambe Bay by Dale Wright.

Works on SaaS and Enterprise for Windows (as of August 2022)

### How to use:
#### Dimensions:
Any dimension as long as its formatted as a Date in qlik (i.e has has both text and numeric representation)

#### Measures:
1. (Mandatory) Value for the line (Format generally be passed through to the chart)
2.(optional) Identifier for recalculation periods.  If used must be contiguous and not repeated out of sequence

#### Sorting
Make sure sorting is by dimension first, if it looks like the below its probably sorting by your measure first ![image](https://user-images.githubusercontent.com/111445780/186640157-8bbeea38-a9a3-49e2-b531-47569b234dd5.png)

#### SPC Controls
##### Targets
Setting to 1 will enable targets and also the second summary icon. If measure is formatted as a percentage target will be formatted appropriately

##### Settings
Is Higher Better?
0 = no 1 = yes 2+= neither (purple icons)
Baseline -  if ticked an option for the number of initial points within a recalculation period to use as a baseline for mean and control limits
Allow limit under zero - allows the lower control limit to be less than zero
Run above/below mean - number of sequential points to indicate a shift
increasing/decreasing trends - number of sequential points to indicate a trend
consecutive points within 1 sigma - number of sequential points to highlight a clustering around mean

##### Format
Forced zero -  y axis has a forced zero
Show labels - show/hide axis titles
Hide Axis - hide the values on the x axis (useful for fudging a Tchart)
Show recalculation periods - will turn on highlighting  of the recalculation periods
Colour Array -  overrides default colouring of periods - use CSS names or hex codes delimited by ;
width of defintion table - set width of table on the right in pixels, use 0 to disable.

