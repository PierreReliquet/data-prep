(function() {
    'use strict';

    var state = {};

    /**
     * @ngdoc service
     * @name data-prep.services.state.service:StateService
     * @description Entry level for State services
     */
    function StateService(PlaygroundStateService, playgroundState, //
                          DatasetStateService, datasetState, //
                          FolderStateService, folderState,  //
                          EasterEggsStateService, easterEggsState, //
                          InventoryStateService, inventoryState,
                          FeedbackStateService, feedbackState) {
        state.playground = playgroundState;
        state.dataset = datasetState;
        state.folder = folderState;
        state.easterEggsState = easterEggsState;
        state.inventory = inventoryState;
        state.feedback = feedbackState;

        return {
            //playground
            hidePlayground: PlaygroundStateService.hide,
            showPlayground: PlaygroundStateService.show,
            resetPlayground: PlaygroundStateService.reset,
            setCurrentDataset: PlaygroundStateService.setDataset,
            setCurrentData: PlaygroundStateService.setData,
            setCurrentLookupData: PlaygroundStateService.setLookupData,
            setCurrentPreparation: PlaygroundStateService.setPreparation,
            setNameEditionMode: PlaygroundStateService.setNameEditionMode,
            updateColumnsStatistics: PlaygroundStateService.updateColumnsStatistics,

            //playground - recipe
            hideRecipe: PlaygroundStateService.hideRecipe,
            showRecipe: PlaygroundStateService.showRecipe,

            //playground - grid
            setColumnFocus: PlaygroundStateService.setColumnFocus,
            setGridSelection: PlaygroundStateService.setGridSelection,

            //playground - lookup
            setLookupActions: PlaygroundStateService.setLookupActions,
            setLookupDataset: PlaygroundStateService.setLookupDataset,
            setLookupSelectedColumn: PlaygroundStateService.setLookupSelectedColumn,
            setLookupVisibility: PlaygroundStateService.setLookupVisibility,
            updateLookupColumnsToAdd: PlaygroundStateService.updateLookupColumnsToAdd,
            setLookupStep: PlaygroundStateService.setLookupStep,
            setLookupUpdateMode: PlaygroundStateService.setLookupUpdateMode,
            setLookupAddMode: PlaygroundStateService.setLookupAddMode,
            setUpdatingLookupStep: PlaygroundStateService.setUpdatingLookupStep,

            //playground - filters
            addGridFilter: PlaygroundStateService.addGridFilter,
            removeGridFilter: PlaygroundStateService.removeGridFilter,
            removeAllGridFilters: PlaygroundStateService.removeAllGridFilters,
            updateGridFilter: PlaygroundStateService.updateGridFilter,

            //playground - Suggestions
            setColumnTransformations: PlaygroundStateService.setColumnTransformations,
            setLineTransformations: PlaygroundStateService.setLineTransformations,
            setSuggestionsLoading: PlaygroundStateService.setSuggestionsLoading,
            setTransformationsForEmptyCells: PlaygroundStateService.setTransformationsForEmptyCells,
            setTransformationsForInvalidCells: PlaygroundStateService.setTransformationsForInvalidCells,
            updateFilteredTransformations: PlaygroundStateService.updateFilteredTransformations,

            //playground - Statistics
            setStatisticsHistogram: PlaygroundStateService.setStatisticsHistogram,
            setStatisticsFilteredHistogram: PlaygroundStateService.setStatisticsFilteredHistogram,
            setStatisticsHistogramActiveLimits: PlaygroundStateService.setStatisticsHistogramActiveLimits,
            setStatisticsPatterns: PlaygroundStateService.setStatisticsPatterns,
            setStatisticsFilteredPatterns: PlaygroundStateService.setStatisticsFilteredPatterns,

            //dataset
            startUploadingDataset: DatasetStateService.startUploadingDataset,
            finishUploadingDataset: DatasetStateService.finishUploadingDataset,

            //folder
            setCurrentFolder: FolderStateService.setCurrentFolder,
            setCurrentFolderContent: FolderStateService.setCurrentFolderContent,
            setFoldersStack: FolderStateService.setFoldersStack,
            setMenuChildren: FolderStateService.setMenuChildren,

            //easter eggs
            enableEasterEgg: EasterEggsStateService.enableEasterEgg,
            disableEasterEgg: EasterEggsStateService.disableEasterEgg,

            //inventory
            setPreparations: InventoryStateService.setPreparations,
            removePreparation: InventoryStateService.removePreparation,

            //feedback
            showFeedback: FeedbackStateService.show,
            hideFeedback: FeedbackStateService.hide
        };
    }

    angular.module('data-prep.services.state')
        .service('StateService', StateService)
        .constant('state', state);
})();