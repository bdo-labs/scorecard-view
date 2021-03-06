
angular.module('scorecardView').directive('scorecardView',
  ['$compile', 'scorecardService', 'aggregationService', 'indicatorService', 'organizationalNodeService',
  function ($compile, scorecardService, aggregationService, indicatorService, orgNodeService) {

    function link(scope, element, attributes) {
      var indicatorWatchers = [];

      scope.getCurrent = function(indicator, listType) {
        var agg;

        if (listType === 'measurements') {
          agg = indicatorService.aggregatePeriodMeasurement;
        } else if (listType === 'goals') {
          agg = indicatorService.aggregatePeriodGoal;
        }
        return agg(indicator, scope.orgnodeObject, scope.date ? scope.date : new Date());
      };

      function updateValues() {
        if (!scope.scorecard || !scope.scorecard.indicators) {
          return;
        }

        scope.indicatorGroups = scorecardService
          .getIndicatorGroups(scope.scorecard.indicators);

      }

      attributes.$observe('scorecardId', function (id) {
        scope.scorecard = scorecardService.get(
          isNaN(id) ? id : Number(id)
        );
      });

      scope.$watch('orgnode', function () {
        scope.orgnodeObject = orgNodeService.get(Number(scope.orgnode));
      });

      scope.$watchCollection('scorecard.indicators', function () {
        var scorecard = scope.scorecard;

        indicatorWatchers.forEach(function (watcher) {
          watcher();
        });

        if (!scorecard || !scorecard.indicators) {
          return;
        }

        indicatorWatchers = [];

        scorecard.indicators.forEach(function (indicator) {

          indicatorWatchers.push(
            scope.$watch(
              function () {
                return indicator.category;
              },
              updateValues
            )
          );

        });

        updateValues();
      });

      // FIXME scope.scorecardType is undefined, why?
      scope.scorecardType = 'full';

      scope.$watch(scope.scorecardType, function () {
        var tmpl;

        if (scope.scorecardType === 'overview') {
          element.addClass('small breaking-box');
          tmpl = require('./partials/scorecard-overview.html');
        } else {
          element.addClass('large');
          tmpl = require('./partials/scorecard-full.html');
        }

        var elements = $compile(tmpl)(scope);
        element.empty().append(elements);
      });
    }

    return {
      scope: { scorecardType: '=', date: '=?', orgnode: '=' },
      link: link
    }
  }
]);

