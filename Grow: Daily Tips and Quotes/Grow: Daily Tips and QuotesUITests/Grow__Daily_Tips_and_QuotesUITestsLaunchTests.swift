//
//  Grow__Daily_Tips_and_QuotesUITestsLaunchTests.swift
//  Grow: Daily Tips and QuotesUITests
//
//  Created by Wilson.Shakya on 13/10/24.
//

import XCTest

final class Grow__Daily_Tips_and_QuotesUITestsLaunchTests: XCTestCase {

    override class var runsForEachTargetApplicationUIConfiguration: Bool {
        true
    }

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testLaunch() throws {
        let app = XCUIApplication()
        app.launch()

        // Insert steps here to perform after app launch but before taking a screenshot,
        // such as logging into a test account or navigating somewhere in the app

        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = "Launch Screen"
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
