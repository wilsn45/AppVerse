//
//  View+Extension.swift
//  I
//
//  Created by Wilson.Shakya on 28/07/24.
//

import Foundation
import SwiftUI

// MARK: View

extension View {
	func hideKeyboard() {
		UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
	}
}
